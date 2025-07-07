import { RequestHandler } from "express";
import { HttpError } from "../utils/httpError";
import bcrypt from "bcryptjs";
import { generateJWT } from "../utils/generateToken";
import { validateEmail, validatePassword } from "../utils/validators";
import { sendEmail } from "../utils/sendEmail";
import { renderEmail } from "../utils/renderEmail";
import { ENV } from "../config/env";
import { connectDB } from "../config/db";
import { v4 as uuidv4 } from 'uuid';

interface registerBody {
    name: string;
    nickname: string;
    email: string;
    password: string;
}

export const register: RequestHandler<{}, {}, registerBody> = async (req, res) => {
    const { email, password, nickname } = req.body

    if(!email || !password || !nickname) {
        throw new HttpError("Please add all fields", 400)
    }
    else if(!validateEmail(email)) {
        throw new HttpError("Invalid email", 400);
    }
    else if(!validatePassword(password)) {
        throw new HttpError("Weak Password", 400);
    }

    const connection = await connectDB();

    const [existingUserByEmail] = await connection.execute(
        `SELECT * FROM users WHERE email = ?`,
        [email]
    );

    if (Array.isArray(existingUserByEmail) && existingUserByEmail.length > 0) {
        throw new HttpError("Email already registered", 400);
    }

    const [existingUserByNickname] = await connection.execute(
        `SELECT * FROM users WHERE nickname = ?`,
        [nickname]
    );

    if (Array.isArray(existingUserByNickname) && existingUserByNickname.length > 0) {
        throw new HttpError("Nickname already exists", 400);
    }

    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)

    const userId = uuidv4();
    await connection.execute(
        `INSERT INTO users (id, nickname, email, password) VALUES (?, ?, ?, ?)`,
        [userId, nickname, email, hashedPassword]
    );

    const tokenId = uuidv4();
    const expiresAt = new Date(Date.now() + (60 * 24 * 365) * 60 * 1000);
    await connection.execute(
        `INSERT INTO verify_tokens (id, email, expiresAt, type) VALUES (?, ?, ?, ?)`,
        [tokenId, email, expiresAt, "email"]
    );

    sendEmail(
      email,
      "IFBShare: Confirm your account",
      await renderEmail("confirm-account-email", {
        link: `${ENV.CLIENT_DOMAIN}/verify-email?token=${tokenId}&expire=${expiresAt.getTime()}`,
        nickname: nickname,
      })
    );

    res.status(201).json({ success: true, message: "Your account has been successfully created! Please check your email to verify your account." })
}

interface loginBody {
    email: string;
    password: string;
}

export const login: RequestHandler<{}, {}, loginBody> = async (req, res) => {
    const { email, password } = req.body 

    const connection = await connectDB();
    const [rows] = await connection.execute(
        `SELECT * FROM users WHERE email = ?`,
        [email]
    );
    const user = Array.isArray(rows) ? rows[0] : null;

    if (user && (await bcrypt.compare(password, user.password))) {
        if (!user.verified) {
            throw new HttpError("Verify your account", 400);
        }

        const token = generateJWT(user.id); 

        res.cookie('authToken', token, {
            httpOnly: true,
            sameSite: "none",
            partitioned: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: true
        });

        res.status(201).json({ success: true , message: "You have successfully logged in." })

    } 
    else {
        throw new HttpError("Invalid credentials", 400)
    }
}

export const logout: RequestHandler = async (_req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        sameSite: "none",
        partitioned: true,
        secure: true
    });

    res.status(201).json({ success: true , message: "You have successfully logout." })
}

export const deleteMe: RequestHandler = async (req, res) => {
    const userId = req?.userId;

    const connection = await connectDB();
    const [result] = await connection.execute(
        `DELETE FROM users WHERE id = ?`,
        [userId]
    );

    if (Array.isArray(result) && result.affectedRows === 0) {
        throw new HttpError("User not found", 404);
    }

    res.status(200).send({ success: true, message: "User deleted successfully" });
}

interface RequestPasswordBody {
    email: string;
}
export const requestPassword: RequestHandler<{}, {}, RequestPasswordBody> = async (req, res) => {
    const { email } = req.body;

    if(!email) {
        throw new HttpError("Please add email", 400);
    }
    else if(!validateEmail(email)) {
        throw new HttpError("Invalid email", 400);
    }

    const connection = await connectDB();
    const [rows] = await connection.execute(
        `SELECT * FROM users WHERE email = ?`,
        [email]
    );
    const user = Array.isArray(rows) ? rows[0] : null;

    if(user) {
        const [existingTokens] = await connection.execute(
            `SELECT * FROM verify_tokens WHERE email = ? AND type = ?`,
            [user.email, "password_reset"]
        );

        if (Array.isArray(existingTokens) && existingTokens.length > 0) {
            await connection.execute(
                `DELETE FROM verify_tokens WHERE email = ? AND type = ?`,
                [user.email, "password_reset"]
            );
        }

        const tokenId = uuidv4();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await connection.execute(
            `INSERT INTO verify_tokens (id, email, expiresAt, type) VALUES (?, ?, ?, ?)`,
            [tokenId, user.email, expiresAt, "password_reset"]
        );

        sendEmail(
          user.email,
          "IFBShare: Reset your password",
          await renderEmail("reset-password-email", {
            link: `${ENV.CLIENT_DOMAIN}/reset-password?token=${tokenId}&expire=${expiresAt.getTime()}`,
            nickname: user.nickname,
          })
        );
    }

    res.status(201).json({ success: true, message: "We sent you instructions to reset your password." });
}

interface ResetPasswordBody {
    token: string;
    password: string;
    confirmPassword: string;
}

export const resetPassword: RequestHandler<{}, {}, ResetPasswordBody> = async (req, res) => {
    const { token , password, confirmPassword } = req.body;

    if(!token) {
        throw new HttpError("Token is necessary", 400);
    }
    else if(!password || !confirmPassword) {
        throw new HttpError("Please add a password", 400);
    }
    else if (password !== confirmPassword) {
        throw new HttpError("Passwords do not match", 400);
    }
    else if(!validatePassword(password)) {
        throw new HttpError("Weak Password", 400);
    }

    const connection = await connectDB();
    const [tokenRows] = await connection.execute(
        `SELECT * FROM verify_tokens WHERE id = ?`,
        [token]
    );
    const verifyToken = Array.isArray(tokenRows) ? tokenRows[0] : null;

    if(!verifyToken) {
        throw new HttpError("Token expired, please request a new one!", 404);
    }

    if(verifyToken.type !== "password_reset") {
        throw new HttpError("Token not valid", 400);
    }

    const [userRows] = await connection.execute(
        `SELECT * FROM users WHERE email = ?`,
        [verifyToken.email]
    );
    const user = Array.isArray(userRows) ? userRows[0] : null;

    if(!user) {
        throw new HttpError("User not found", 404);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const [updateResult] = await connection.execute(
        `UPDATE users SET password = ? WHERE id = ?`,
        [hashedPassword, user.id]
    );

    if (Array.isArray(updateResult) && updateResult.affectedRows === 0) {
        throw new HttpError("Failed to update user", 500);
    }

    await connection.execute(
        `DELETE FROM verify_tokens WHERE id = ?`,
        [verifyToken.id]
    );

    res.status(200).json({ success: true, message: "User updated successfully" });
}


interface verifyEmailBody {
    token: string;
}

export const verifyEmail: RequestHandler<{}, {}, verifyEmailBody> = async (req, res) => {
    const { token } = req.body;

    if(!token) {
        throw new HttpError("Token is necessary", 400);
    }

    const connection = await connectDB();
    const [tokenRows] = await connection.execute(
        `SELECT * FROM verify_tokens WHERE id = ?`,
        [token]
    );
    const verifyToken = Array.isArray(tokenRows) ? tokenRows[0] : null;

    if(!verifyToken) {
        throw new HttpError("Token expired, please create a new account!", 404);
    }

    if(verifyToken.type !== "email") {
        throw new HttpError("Token not valid", 400);
    }

    const [userRows] = await connection.execute(
        `SELECT * FROM users WHERE email = ?`,
        [verifyToken.email]
    );
    const user = Array.isArray(userRows) ? userRows[0] : null;

    if(!user) {
        throw new HttpError("User not found", 404);
    }

    const [updateResult] = await connection.execute(
        `UPDATE users SET verified = TRUE WHERE id = ?`,
        [user.id]
    );

    if (Array.isArray(updateResult) && updateResult.affectedRows === 0) {
        throw new HttpError("Failed to verify user", 500);
    }

    await connection.execute(
        `DELETE FROM verify_tokens WHERE id = ?`,
        [verifyToken.id]
    );

    res.status(200).json({ success: true, message: "User verified successfully" });
}
import { RequestHandler } from "express";
import { HttpError } from "../utils/httpError";
import bcrypt from "bcryptjs";
import { generateJWT } from "../utils/generateToken";
import { validateEmail, validatePassword } from "../utils/validators";
import userModel from "../models/user.model";
import verifyTokenModel, { VerifyTokenType } from "../models/verifyToken.model";
import { sendEmail } from "../utils/sendEmail";
import { renderEmail } from "../utils/renderEmail";
import { ENV } from "../config/env";


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
    else if(await userModel.findOne({ email })) {
        throw new HttpError("Email already registered", 400)
    }
    else if(await userModel.findOne({ nickname })) {
        throw new HttpError("Nickname already exists", 400)
    }

    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new userModel({
        nickname,
        email,
        password: hashedPassword
    })

    const newToken = await verifyTokenModel.create({
        email,
        expiresAt: new Date(Date.now() + (60 * 24 * 365) * 60 * 1000),
        type: VerifyTokenType.EMAIL
    });

    if(!newToken) {
        throw new HttpError("Verification token not created", 500);
    }

    const user = await newUser.save();

    sendEmail(
      user.email,
      "IFBShare: Confirm your account",
      await renderEmail("confirm-account-email", {
        link: `${ENV.CLIENT_DOMAIN}/verify-email?token=${
          newToken._id
        }&expire=${newToken.expiresAt.getTime()}`,
        nickname: user.nickname,
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

    const user = await userModel.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password))) {
        if (!user.verified) {
            throw new HttpError("Verifie yout account", 400);
        }

        const token = generateJWT(user._id); 

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

    const deletedUser = await userModel.findByIdAndDelete(userId);

    if(!deletedUser) {
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

    const user = await userModel.findOne({ email });

    if(user) {
        const tokenToVerifies = await verifyTokenModel.findOne({ email: user.email, verified: false });

        if(tokenToVerifies) {
            await verifyTokenModel.findByIdAndDelete(tokenToVerifies._id);
        }

        const newToken = await verifyTokenModel.create({
            email: user.email,
            verified: false,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            type: VerifyTokenType.PASSWORD_RESET
        });

        if(!newToken) {
            throw new HttpError("Token not created", 500);
        }

        sendEmail(
          user.email,
          "IFBShare: Reset your password",
          await renderEmail("reset-password-email", {
            link: `${ENV.CLIENT_DOMAIN}/reset-password?token=${
              newToken._id
            }&expire=${newToken.expiresAt.getTime()}`,
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

    const verifyToken = await verifyTokenModel.findById(token);

    if(!verifyToken) {
        throw new HttpError("Token expired, please request a new one!", 404);
    }

    if(verifyToken.type !== VerifyTokenType.PASSWORD_RESET) {
        throw new HttpError("Token not valid", 400);
    }

    const user = await userModel.findOne({ email: verifyToken.email });

    if(!user) {
        throw new HttpError("User not found", 404);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await userModel.findByIdAndUpdate(
        user._id, 
        { password: hashedPassword }
    );

    if(!updatedUser) {
        throw new HttpError("Failed to update user", 500);
    }

    await verifyTokenModel.findByIdAndDelete(verifyToken._id);

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

    const verifyToken = await verifyTokenModel.findById(token);

    if(!verifyToken) {
        throw new HttpError("Token expired, please create a new account!", 404);
    }

    if(verifyToken.type !== VerifyTokenType.EMAIL) {
        throw new HttpError("Token not valid", 400);
    }

    const user = await userModel.findOne({ email: verifyToken.email });

    if(!user) {
        throw new HttpError("User not found", 404);
    }

    const updatedUser = await userModel.findByIdAndUpdate(
        user._id, 
        { verified: true }
    );

    if(!updatedUser) {
        throw new HttpError("Failed to verify user", 500);
    }

    await verifyTokenModel.findByIdAndDelete(verifyToken._id);

    res.status(200).json({ success: true, message: "User verified successfully" });
}
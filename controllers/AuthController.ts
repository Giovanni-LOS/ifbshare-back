import { RequestHandler } from "express";
import { HttpError } from "../utils/httpError";
import bcrypt from "bcryptjs";
import { generateJWT } from "../utils/generateToken";
import { validateEmail, validatePassword } from "../utils/validators";
import { VerifyTokenType } from "../models/verifyToken.model";
import VerifyTokenDAO_Mongoose from "../persistencelayer/dao/VerifyTokenDAO_Mongoose";
import { VerifyTokenDTO } from "../persistencelayer/persistence/VerifyTokenDTO";
import { sendEmail } from "../utils/sendEmail";
import { renderEmail } from "../utils/renderEmail";
import { ENV } from "../config/env";
import UserDAO_Mongoose from "../persistencelayer/dao/UserDAO_Mongoose";
import { UserDTO } from "../persistencelayer/persistence/UserDTO";

import { 
    IAuthController, 
    registerBody, 
    loginBody, 
    RequestPasswordBody, 
    ResetPasswordBody, 
    verifyEmailBody 
} from "./IAuthController";

class AuthController implements IAuthController {
    private userDAO: UserDAO_Mongoose;
    private verifyTokenDAO: VerifyTokenDAO_Mongoose;

    constructor() {
        this.userDAO = new UserDAO_Mongoose();
        this.verifyTokenDAO = new VerifyTokenDAO_Mongoose();
    }

    public register: RequestHandler<Record<string, unknown>, Record<string, unknown>, registerBody> = async (req, res) => {
        const { email, password, nickname } = req.body

        if(!email || !password || !nickname) {
            throw new HttpError("Please add all fields", 400)
        }
        else if(!validateEmail(email)) {
            throw new HttpError(
              `Invalid email. Ensure it is properly formatted and ends with ` + ENV.IFB_DOMAIN,
              400
            );
        }
        else if(!validatePassword(password)) {
            throw new HttpError(
              "Password is not strong enough. It must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one number, and one symbol.",
              400
            );
        }
        else if(await this.userDAO.findByEmail(email)) {
            throw new HttpError("Email already registered", 400)
        }
        else if(await this.userDAO.findByNickname(nickname)) {
            throw new HttpError("Nickname already exists", 400)
        }

        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await this.userDAO.saveWithPassword({
            nickname,
            email,
            password: hashedPassword,
            verified: false
        });

        const verifyTokenDTO = new VerifyTokenDTO();
        verifyTokenDTO.email = email;
        verifyTokenDTO.expiresAt = new Date(Date.now() + (60 * 24 * 365) * 60 * 1000);
        verifyTokenDTO.type = VerifyTokenType.EMAIL;

        const newToken = await this.verifyTokenDAO.save(verifyTokenDTO);

        if(!newToken) {
            throw new HttpError("Verification token not created", 500);
        }

        sendEmail(
          user.email,
          "IFBShare: Confirm your account",
          await renderEmail("confirm-account-email", {
            link: `${ENV.CLIENT_DOMAIN}/verify-email?token=${
              newToken.id
            }&expire=${newToken.expiresAt.getTime()}`,
            nickname: user.nickname,
          })
        );

        res.status(201).json({ success: true, message: "Your account has been successfully created!" })
    }

    public login: RequestHandler<Record<string, unknown>, Record<string, unknown>, loginBody> = async (req, res) => {
        const { email, password } = req.body 

        const userWithPassword = await this.userDAO.findByEmailWithPassword(email)

        if (userWithPassword && (await bcrypt.compare(password, userWithPassword.password))) {
            const user = userWithPassword.user;
            /*
            if (!user.verified) {
                throw new HttpError("Verifie your account", 400);
            }
            */

            if (!user.id) {
                throw new HttpError("User ID missing", 500);
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

    public logout: RequestHandler = async (_req, res) => {
        res.clearCookie('authToken', {
            httpOnly: true,
            sameSite: "none",
            partitioned: true,
            secure: true
        });

        res.status(201).json({ success: true , message: "You have successfully logout." })
    }

    public deleteMe: RequestHandler = async (req, res) => {
        const userId = req?.userId;

        if (!userId) {
            throw new HttpError("User not found", 404);
        }

        await this.userDAO.delete(userId);

        res.status(200).send({ success: true, message: "User deleted successfully" });
    }

    public requestPassword: RequestHandler<Record<string, unknown>, Record<string, unknown>, RequestPasswordBody> = async (req, res) => {
        const { email } = req.body;

        if(!email) {
            throw new HttpError("Please add email", 400);
        }
        else if(!validateEmail(email)) {
            throw new HttpError("Invalid email", 400);
        }

        const user = await this.userDAO.findByEmail(email);

        if(user) {
            const tokenToVerifies = await this.verifyTokenDAO.findOne({ email: user.email, verified: false });

            if(tokenToVerifies) {
                if (!tokenToVerifies.id) {
                    throw new HttpError("Token ID missing", 500);
                }
                await this.verifyTokenDAO.findByIdAndDelete(tokenToVerifies.id);
            }

            const verifyTokenDTO = new VerifyTokenDTO();
            verifyTokenDTO.email = user.email;
            verifyTokenDTO.verified = false;
            verifyTokenDTO.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            verifyTokenDTO.type = VerifyTokenType.PASSWORD_RESET;

            const newToken = await this.verifyTokenDAO.save(verifyTokenDTO);

            if(!newToken) {
                throw new HttpError("Token not created", 500);
            }

            sendEmail(
              user.email,
              "IFBShare: Reset your password",
              await renderEmail("reset-password-email", {
                link: `${ENV.CLIENT_DOMAIN}/reset-password?token=${
                  newToken.id
                }&expire=${newToken.expiresAt.getTime()}`,
                nickname: user.nickname,
              })
            );
        }

        res.status(201).json({ success: true, message: "We sent you instructions to reset your password." });
    }

    public resetPassword: RequestHandler<Record<string, unknown>, Record<string, unknown>, ResetPasswordBody> = async (req, res) => {
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

        const verifyToken = await this.verifyTokenDAO.findById(token);

        if(!verifyToken) {
            throw new HttpError("Token expired, please request a new one!", 404);
        }

        if(verifyToken.type !== VerifyTokenType.PASSWORD_RESET) {
            throw new HttpError("Token not valid", 400);
        }

        const user = await this.userDAO.findByEmail(verifyToken.email);

        if(!user) {
            throw new HttpError("User not found", 404);
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        if (!user.id) {
            throw new HttpError("User ID missing", 500);
        }

        await this.userDAO.updatePassword(user.id, hashedPassword);

        if(!verifyToken.id) {
            throw new HttpError("Token ID missing", 500);
        }

        await this.verifyTokenDAO.findByIdAndDelete(verifyToken.id);

        res.status(200).json({ success: true, message: "User updated successfully" });
    }

    public verifyEmail: RequestHandler<Record<string, unknown>, Record<string, unknown>, verifyEmailBody> = async (req, res) => {
        const { token } = req.body;

        if(!token) {
            throw new HttpError("Token is necessary", 400);
        }

        const verifyToken = await this.verifyTokenDAO.findById(token);

        if(!verifyToken) {
            throw new HttpError("Token expired, please create a new account!", 404);
        }

        if(verifyToken.type !== VerifyTokenType.EMAIL) {
            throw new HttpError("Token not valid", 400);
        }

        const user = await this.userDAO.findByEmail(verifyToken.email);

        if(!user) {
            throw new HttpError("User not found", 404);
        }

        const userDTO = new UserDTO();
        userDTO.id = user.id;
        userDTO.verified = true;

        await this.userDAO.update(userDTO);

        if(!verifyToken.id) {
            throw new HttpError("Token ID missing", 500);
        }

        await this.verifyTokenDAO.findByIdAndDelete(verifyToken.id);

        res.status(200).json({ success: true, message: "User verified successfully" });
    }
}

export default AuthController;
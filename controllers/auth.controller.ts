import { RequestHandler } from "express";
import { HttpError } from "../utils/httpError";
import bcrypt from "bcryptjs"
import { generateJWT } from "../utils/generateToken";
import { validateEmail, validatePassword } from "../utils/validators";
import userModel from "../models/user.model";


interface registerBody {
    name: string;
    nickname: string;
    email: string;
    password: string;
}

export const register: RequestHandler<{}, {}, registerBody> = async (req, res, next) => {
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

    const user = await newUser.save()

    const token = generateJWT(user._id); 

    res.cookie('authToken', token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
        secure: true
    });

    res.status(201).json({ success: true, message: "Account created successfully!"})
}

interface loginBody {
    email: string;
    password: string;
}

export const login: RequestHandler<{}, {}, loginBody> = async (req, res, next) => {
    const { email, password } = req.body 

    const user = await userModel.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password))) {
        const token = generateJWT(user._id); 

        res.cookie('authToken', token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
            secure: true     
        });

        res.status(201).json({ success: true , message: "You have successfully logged in."})

    } 
    else {
        throw new HttpError("Invalid credentials", 400)
    }
}

export const logout: RequestHandler = async (req, res, next) => {
    const userId = req?.userId

    const user = await userModel.findOne({ userId })

    if (user) {
        res.clearCookie('authToken', {
            httpOnly: true,
            sameSite: "strict", 
            secure: true   
        });

        res.status(201).json({ success: true , message: "You have successfully loggout." })
    } 
    else {
        throw new HttpError("Invalid credentials", 400)
    }
}

export const getMe: RequestHandler = async (req, res, next) => {
    const userId = req?.userId

    const user = await userModel.findOne({ userId }).select("-password");

    if (user) { 
        res.status(201).json({ success: true , data: user })
    }
    else {
        throw new HttpError("Invalid credentials", 400)
    }
}

export const updateMe: RequestHandler = async (req, res, next) => {
    const {  password, nickname } = req.body
    const userId = req?.userId

    if( !password || !nickname) {
        throw new HttpError("Please add all fields!", 400)
    }
    else if(!validatePassword(password)) {
        throw new HttpError("Weak Password!", 400);
    }
    else if(await userModel.findOne({ nickname })) {
        throw new HttpError("Nickname already exists!", 400)
    }

    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new userModel({
        nickname,
        password: hashedPassword
    })

    const user = await userModel.findById(userId)

    if (!user) {
        throw new HttpError("user not found", 404)
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, newUser, { new: true })

    res.status(201).json({ success: true, message: "User updated successfully!", data: updatedUser })
}

export const deleteMe: RequestHandler = async (req, res, next) => {
    const userId = req?.userId;

    const deletedUser = await userModel.findByIdAndDelete(userId);

    if(!deletedUser) {
        throw new HttpError("User not found", 404);
    }

    res.status(200).send({ success: true, message: "User deleted successfully" });

}
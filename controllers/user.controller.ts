import { RequestHandler } from "express";
import { HttpError } from "../utils/httpError";
import { UserDegreeType } from "../models/user.model";
import mongoose from "mongoose";
import { fileTypeFromBuffer } from "file-type";
import UserDAO_Mongoose from "../persistencelayer/dao/UserDAO_Mongoose";
import PostDAO_Mongoose from "../persistencelayer/dao/PostDAO_Mongoose";
import { UserDTO } from "../persistencelayer/persistence/UserDTO";

const userDAO = new UserDAO_Mongoose();
const postDAO = new PostDAO_Mongoose();

interface HeaderId {
    userId: string;
}

interface HeaderNickname {
    nickname: string;
}

export const getUserById: RequestHandler<HeaderId, Record<string, unknown>, Record<string, unknown>> = async (req, res) => {
    const { userId } = req.params;

    if(!mongoose.isValidObjectId(userId)) {
        throw new HttpError("Invalid user id", 400);
    }

    const user = await userDAO.findById(userId);

    if (!user) {
        throw new HttpError("User not found", 404);
    }

    res.status(201).json({ success: true , data: user, message: "User fetched successfully" })
}

export const getUserByNickname: RequestHandler<HeaderNickname, Record<string, unknown>, Record<string, unknown>> = async (req, res) => {
    const { nickname } = req.params;

    const user = await userDAO.findByNickname(nickname);

    if(!user) {
        throw new HttpError("User not found", 404);
    }

    res.status(201).json({ success: true , data: user, message: "User fetched successfully" })
}


export const getUserPostsById: RequestHandler<HeaderId, Record<string, unknown>, Record<string, unknown>> = async (req, res) => {
    const { userId } = req.params;

    if(!mongoose.isValidObjectId(userId)) {
        throw new HttpError("Invalid user id", 400);
    }

    const user = await userDAO.findById(userId);

    if (!user) {
        throw new HttpError("User not found", 404);
    }

    const posts = await postDAO.findAllByUsuarioId(user.id);

    if (!posts) {
        throw new HttpError("Posts not found", 404);
    }

    res.status(200).send({ success: true, data: posts, message: "Posts fetched successfully" });
}

export const getUserPostsByNickname: RequestHandler<HeaderNickname> = async (req, res) => {
    const { nickname } = req.params;

    const user = await userDAO.findByNickname(nickname);

    if(!user) {
        throw new HttpError("User not found", 404);
    }

    const posts = await postDAO.findAllByUsuarioId(user.id);

    if (!posts) {
        throw new HttpError("Posts not found", 404);
    }

    res.status(200).send({ success: true, data: posts, message: "Posts fetched successfully" });
}

interface UpdateMeBody {
    nickname: string;
    degree: UserDegreeType;
}

export const updateMe: RequestHandler<Record<string, unknown>, Record<string, unknown>, UpdateMeBody> = async (req, res) => {
    const { nickname, degree } = req.body
    const userId = req?.userId
    const file: Express.Multer.File = req.file as Express.Multer.File
    const user = await userDAO.findById(userId);

    if (!user) {
        throw new HttpError("user not found", 404)
    }
    else if(nickname !== user.nickname && await userDAO.findByNickname(nickname)) {
        throw new HttpError("Nickname already exists!", 400)
    }
    else if (degree && !Object.values(UserDegreeType).includes(degree)) {
        throw new HttpError("Degree not valid", 400);
    }

    const updateData = new UserDTO();
    updateData.id = user.id;
    if (nickname) updateData.nickname = nickname;
    if (degree) updateData.degree = degree;
    if (file) updateData.picture = file.buffer;

    const updatedUser = await userDAO.update(updateData);

    res.status(201).json({ success: true, message: "User updated successfully!", data: updatedUser })
}

export const getMe: RequestHandler<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>> = async (req, res) => {
    const userId = req?.userId

    const user = await userDAO.findById(userId);

    if (user) { 
        let picture = null;
        if (user.picture) {
            const fileType = await fileTypeFromBuffer(user.picture);
            picture = {
                data: user.picture.toString("base64"),
                type: fileType?.mime,
            };
        }

        res.status(201).json({ success: true , message: "User successfully fetched.", data: {
            ...user,
            picture
        } })
    }
    else {
        throw new HttpError("Invalid credentials", 400)
    }
}
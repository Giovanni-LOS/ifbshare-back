import { RequestHandler } from "express";
import postModel from "../models/post.model";
import { HttpError } from "../utils/httpError";
import userModel, { UserDegreeType } from "../models/user.model";
import mongoose from "mongoose";
import { fileTypeFromBuffer } from "file-type";

interface HeaderId {
    userId: string;
}

interface HeaderNickname {
    nickname: string;
}

export const getUserById: RequestHandler<HeaderId> = async (req, res, next) => {
    const { userId } = req.params;

    if(!mongoose.isValidObjectId(userId)) {
        throw new HttpError("Invalid user id", 400);
    }

    const user = await userModel.findOne({ _id: userId }).select("-password -email");

    if (!user) {
        throw new HttpError("User not found", 404);
    }

    res.status(201).json({ success: true , data: user, message: "User fetched successfully" })
}

export const getUserByNickname: RequestHandler<HeaderNickname> = async (req, res, next) => {
    const { nickname } = req.params;

    const user = await userModel.findOne({ nickname }).select("-password -email");

    if(!user) {
        throw new HttpError("User not found", 404);
    }

    res.status(201).json({ success: true , data: user, message: "User fetched successfully" })
}


export const getUserPostsById: RequestHandler<HeaderId> = async (req, res) => {
    const { userId } = req.params;

    if(!mongoose.isValidObjectId(userId)) {
        throw new HttpError("Invalid user id", 400);
    }

    const user = await userModel.findOne({ _id: userId });

    if (!user) {
        throw new HttpError("User not found", 404);
    }

    const posts = await postModel.find({ author: user._id });

    if (!posts) {
        throw new HttpError("Posts not found", 404);
    }

    res.status(200).send({ success: true, data: posts, message: "Posts fetched successfully" });
}

export const getUserPostsByNickname: RequestHandler<HeaderNickname> = async (req, res) => {
    const { nickname } = req.params;

    const user = await userModel.findOne({ nickname });

    if(!user) {
        throw new HttpError("User not found", 404);
    }

    const posts = await postModel.find({ author: user._id });

    if (!posts) {
        throw new HttpError("Posts not found", 404);
    }

    res.status(200).send({ success: true, data: posts, message: "Posts fetched successfully" });
}

interface UpdateMeBody {
    nickname: string;
    degree: UserDegreeType;
}

export const updateMe: RequestHandler<{}, {}, UpdateMeBody> = async (req, res) => {
    const { nickname, degree } = req.body
    const userId = req?.userId
    const file: Express.Multer.File = req.file as Express.Multer.File
    const user = await userModel.findById(userId);

    if (!user) {
        throw new HttpError("user not found", 404)
    }
    else if(nickname !== user.nickname && await userModel.findOne({ nickname })) {
        throw new HttpError("Nickname already exists!", 400)
    }
    else if (degree && !Object.values(UserDegreeType).includes(degree)) {
        throw new HttpError("Degree not valid", 400);
    }

    const updateData: {
        degree?: UserDegreeType;
        nickname?: string;
        picture?: Buffer;
    } = {};
    if (nickname) updateData.nickname = nickname;
    if (degree) updateData.degree = degree;
    if (file) updateData.picture = file.buffer;

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, { $set: updateData }, { new: true })
      .select("-password");



    res.status(201).json({ success: true, message: "User updated successfully!", data: updatedUser })
}

export const getMe: RequestHandler = async (req, res) => {
    const userId = req?.userId

    const user = await userModel.findOne({ _id: userId }).select("-password");

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
            ...user.toJSON(),
            picture
        } })
    }
    else {
        throw new HttpError("Invalid credentials", 400)
    }
}
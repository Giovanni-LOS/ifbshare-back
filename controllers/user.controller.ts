import { RequestHandler } from "express";
import postModel from "../models/post.model";
import { HttpError } from "../utils/httpError";
import userModel from "../models/user.model";
import mongoose from "mongoose";

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
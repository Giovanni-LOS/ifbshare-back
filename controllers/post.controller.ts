import { RequestHandler } from "express";
import postModel from "../models/post.model";
import fileModel from "../models/file.model"
import { HttpError } from "../utils/httpError";
import mongoose from "mongoose";


interface HeaderId {
    id: string;
}

export const getPosts: RequestHandler = async (req, res) => {
    const posts = await postModel.find();

    if (!posts) {
        throw new HttpError("Posts not found", 404);
    }

    res.status(200).send({ success: true, data: posts, message: "Posts fetched successfully" });
}

interface CreatePostBody {
    title: string;
    content: string;
    tags: string[];
}

export const createPost: RequestHandler<{}, {}, CreatePostBody> = async (req, res) => {
    const { title, content, tags } = req.body;
    const author = req?.userId;
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];

    if (!author) {
        throw new HttpError('User ID not found', 404)
    }
    else if(title && !title?.trim()) {
        throw new HttpError("Post must have a Title", 400)
    }

    const post = await postModel.create({ title, content, tags, author });

    if(!post) {
        throw new HttpError("Error creating post", 500)
    }

    if (files) {
        const fileDataPromises = files.map(async (file) => ({
            name: file.originalname,
            contentType: file.mimetype,
            data: file.buffer,
            size: file.size,
            postId: post._id
        }));
        const fileData = await Promise.all(fileDataPromises);
        const fileUpload = await fileModel.insertMany(fileData);

        if(!fileUpload) {
            throw new HttpError("Error uploading files", 500)
        }
    }  

    res.status(201).send({ success: true, data: post, message: "Post created successfully" });
}


export const deletePost: RequestHandler<HeaderId> = async (req, res) => {
    const { id } = req.params;
    const userId = req?.userId;

    const post = await postModel.findById(id);

    if (!post) {
       throw new HttpError("Post not found", 404);
    }

    if(post.author?.toString() !== userId) {
        throw new HttpError("Not authorized to delete this post", 403);
    }

    const filesDeleted = await fileModel.deleteMany({ postId: post._id });
    
    const postDeleted = await postModel.findByIdAndDelete(id);

    res.status(200).send({ success: true, message: "Post deleted successfully", data: postDeleted });
}

interface UpdatePostBody {
    title: string;
    content?: string;
    tags?: string[];
}

export const updatePost: RequestHandler<HeaderId, {}, UpdatePostBody> = async (req, res) => {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const author = req?.userId;

    if(!mongoose.isValidObjectId(id)) {
        throw new HttpError("Task Id not found", 404)
    } 

    else if(title && !title?.trim()) {
        throw new HttpError("Post must have a Title", 400)
    }

    const post = await postModel.findById(id);

    if (!post) {
       throw new HttpError("Post not found", 404);
    }

    if(post.author?.toString() !== author) {
        throw new HttpError("Not authorized to delete this post", 403);
    }

    const updatedPost = await postModel.findByIdAndUpdate( id, { title, content, tags }, { new: true });

    if(!updatePost) {
        throw new HttpError("Error updating post", 500)
    }

    res.status(201).send({ success: true, data: updatedPost, message: "Post updated successfully" });
}

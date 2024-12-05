import { Request, RequestHandler, Response } from "express"
import fileModel from "../models/file.model"
import { HttpError } from "../utils/httpError";
import mongoose from "mongoose";
import postModel from "../models/post.model";

interface HeaderId {
    id: string;
}

export const downloadFile: RequestHandler<HeaderId> = async (req, res) => {
    const { id } = req.params;

    const file = await fileModel.findById(id);

    if (!file) {
        throw new HttpError("File not found", 404);
    }

    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
    res.status(200).send(file.data); 
}

interface getFilesHeader {
    postId: string;
}

export const getFiles: RequestHandler<getFilesHeader> = async (req, res) => {
    const { postId } = req.params;

    if (!postId || !mongoose.isValidObjectId(postId)) {
        throw new HttpError("Post postId is required", 400);
    }
    
    const files = await fileModel.find({ postId });
    
    if (!files.length) {
        throw new HttpError("Files not found", 404);
    }

    res.status(200).json({ 
        success: true, 
        message: "Files fetched successfully", 
        data: files.map(file => ({ 
            _id: file._id,
            name: file.name, 
            size: file.size, 
            contentType: file.contentType,
            createAt: file.createdAt
        }))
    });
}

interface PostFileHeader extends Request {
    postId?: string;
    file?: Express.Multer.File;
}

export const postFile: RequestHandler = async (req: PostFileHeader, res) => {
    const { postId } = req.params;
    const userId = req?.userId;
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];

    if (!postId || !mongoose.isValidObjectId(postId)) {
        throw new HttpError("Post postId is required", 400);
    }
    else if(!files) {
        throw new HttpError("A file is required", 400);
    }
    
    const post = await postModel.findById(postId);

    if(!post) {
        throw new HttpError("Post not found", 404);
    }
    else if(post.author?.toString() !== userId) {
        throw new HttpError("Not authorized to add files to this post", 401);
    }
    
    const fileDataPromises = files.map(async (file) => ({
        name: file.originalname,
        contentType: file.mimetype,
        data: file.buffer,
        size: file.size,
        postId: post._id
    }));
    const fileData = await Promise.all(fileDataPromises);
    const filesUpload = await fileModel.insertMany(fileData);

    if(!filesUpload) {
        throw new HttpError("Error submitting files", 500)
    }

    res.status(200).send({ success: true, message: "File successfully submitted" });
}

interface deleteFileHeader {
    postId: string;
    id: string;
}

export const deleteFile: RequestHandler<deleteFileHeader> = async (req, res) => {
    const { id, postId } = req.params;
    const userId = req?.userId;

    const file = await fileModel.findById(id);

    if (!file) {
        throw new HttpError("File not found", 404);
    }
    else if(file.postId.toString() !== postId) {
        throw new HttpError("File don't associate to this post", 400);
    }
    
    const post = await postModel.findById(postId);

    if(!post) {
        throw new HttpError("Post not found", 404);
    }
    else if(post.author?.toString() !== userId) {
        throw new HttpError("Not authorized to delete files from this post", 401);
    }

    const deletedFile = await fileModel.findByIdAndDelete(id);

    if(!deleteFile) {
        throw new HttpError("File not deleted", 500);
    }

    res.status(200).json({ success: true, message: "File deleted successfully" });
}


import { RequestHandler } from "express"
import { HttpError } from "../utils/httpError";
import mongoose from "mongoose";
import postModel from "../models/post.model";
import FileDAO_Mongoose from "../persistencelayer/dao/FileDAO_Mongoose";
import { FileDTO } from "../persistencelayer/persistence/FileDTO";

interface HeaderId {
    id: string;
}

interface getFilesHeader {
    postId: string;
}

interface PostFileParams {
    postId: string;
}

interface deleteFileHeader {
    postId: string;
    id: string;
}

import { IFileController } from "./IFileController";

class FileController implements IFileController {
    private fileDAO: FileDAO_Mongoose;

    constructor() {
        this.fileDAO = new FileDAO_Mongoose();
    }

    public downloadFile: RequestHandler<HeaderId, Record<string, unknown>, Record<string, unknown>> = async (req, res) => {
        const { id } = req.params;

        const file = await this.fileDAO.findById(id);

        if (!file) {
            throw new HttpError("File not found", 404);
        }

        if (!file.data) {
            throw new HttpError("File data not found", 500);
        }

        // Ensure data is properly converted to Buffer
        let fileData: Buffer;
        if (file.data instanceof Buffer) {
            fileData = file.data;
        } else if (file.data && typeof file.data === 'object' && 'buffer' in file.data) {
            // Handle MongoDB Binary type
            fileData = Buffer.from((file.data as { buffer: ArrayBuffer }).buffer);
        } else {
            // Fallback for other data types
            fileData = Buffer.from(file.data as unknown as Uint8Array);
        }

        res.setHeader("Content-Type", file.contentType || "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
        res.status(200).end(fileData); 
    }

    public getFiles: RequestHandler<getFilesHeader, Record<string, unknown>, Record<string, unknown>> = async (req, res) => {
        const { postId } = req.params;

        if (!postId || !mongoose.isValidObjectId(postId)) {
            throw new HttpError("Post postId is required", 400);
        }
        
        const files = await this.fileDAO.findByPostId(postId);

        res.status(200).json({ 
            success: true, 
            message: "Files fetched successfully", 
            data: files.map(file => ({
                id: file.id,
                name: file.name, 
                size: file.size, 
                contentType: file.contentType,
                createdAt: file.createdAt
            }))
        });
    }

    public postFile: RequestHandler<PostFileParams, Record<string, unknown>, Record<string, unknown>> = async (req, res) => {
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
            throw new HttpError("Not authorized to add files to this post", 403);
        }
        
        const fileDTOs = files.map((file) => {
            const fileDTO = new FileDTO();
            fileDTO.name = file.originalname;
            fileDTO.contentType = file.mimetype;
            fileDTO.data = file.buffer;
            fileDTO.size = file.size.toString(); // Convert number to string to match model
            fileDTO.postId = post._id.toString();
            return fileDTO;
        });
        
        const filesUpload = await this.fileDAO.insertMany(fileDTOs);

        if(!filesUpload) {
            throw new HttpError("Error submitting files", 500)
        }

        res.status(200).send({ success: true, message: "File successfully submitted" });
    }

    public deleteFile: RequestHandler<deleteFileHeader, Record<string, unknown>, Record<string, unknown>> = async (req, res) => {
        const { id, postId } = req.params;
        const userId = req?.userId;

        const file = await this.fileDAO.findById(id);

        if (!file) {
            throw new HttpError("File not found", 404);
        }
        else if(file.postId !== postId) {
            throw new HttpError("File don't associate to this post", 400);
        }
        
        const post = await postModel.findById(postId);

        if(!post) {
            throw new HttpError("Post not found", 404);
        }
        else if(post.author?.toString() !== userId) {
            throw new HttpError("Not authorized to delete files from this post", 403);
        }

        await this.fileDAO.delete(id);

        res.status(200).json({ success: true, message: "File deleted successfully" });
    }
}

export default FileController;
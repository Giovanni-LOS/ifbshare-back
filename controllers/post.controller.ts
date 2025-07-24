import { RequestHandler } from "express";
import { HttpError } from "../utils/httpError";
import mongoose from "mongoose";
import PostDAO_Mongoose from "../persistencelayer/dao/PostDAO_Mongoose";
import { PostDTO } from "../persistencelayer/persistence/PostDTO";
import FileDAO_Mongoose from "../persistencelayer/dao/FileDAO_Mongoose";
import { FileDTO } from "../persistencelayer/persistence/FileDTO";

const postDAO = new PostDAO_Mongoose();
const fileDAO = new FileDAO_Mongoose();

interface HeaderId {
    id: string;
}

export const getPosts: RequestHandler<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>> = async (_req, res) => {
    const posts = await postDAO.findAll();

    if (!posts) {
        throw new HttpError("Posts not found", 404);
    }

    res.status(200).send({ success: true, data: posts, message: "Posts fetched successfully" });
}

export const getPostsById: RequestHandler<HeaderId, Record<string, unknown>, Record<string, unknown>> = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.isValidObjectId(id)) {
        throw new HttpError("Post Id not found", 404)
    }

    const post = await postDAO.findById(id);

    if (!post) {
        throw new HttpError("Post not found", 404);
    }

    res.status(200).send({ success: true, data: post, message: "Post fetched successfully" });
}

interface CreatePostBody {
    title: string;
    content: string;
    tags: string[];
}

export const createPost: RequestHandler<Record<string, unknown>, Record<string, unknown>, CreatePostBody> = async (req, res) => {
    const { title, content, tags } = req.body;
    const author = req?.userId;
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];

    if (!author) {
        throw new HttpError('User ID not found', 404)
    }
    else if(title && !title?.trim()) {
        throw new HttpError("Post must have a Title", 400)
    }

    const postDTO = new PostDTO();
    postDTO.title = title;
    postDTO.content = content || '';
    postDTO.tags = tags || [];
    postDTO.author = author;

    const post = await postDAO.save(postDTO);

    if(!post) {
        throw new HttpError("Error creating post", 500)
    }

    if (files) {
        const fileDTOs = files.map((file) => {
            const fileDTO = new FileDTO();
            fileDTO.name = file.originalname;
            fileDTO.contentType = file.mimetype;
            fileDTO.size = file.size.toString(); // Convert number to string to match model
            fileDTO.postId = post.id;
            fileDTO.data = file.buffer; // Assuming multer provides the buffer
            return fileDTO;
        });
        const fileUpload = await fileDAO.insertMany(fileDTOs);

        if(!fileUpload) {
            throw new HttpError("Error uploading files", 500)
        }
    }  

    res.status(201).send({ success: true, data: post, message: "Post created successfully" });
}


export const deletePost: RequestHandler<HeaderId, Record<string, unknown>, Record<string, unknown>> = async (req, res) => {
    const { id } = req.params;
    const userId = req?.userId;

    const post = await postDAO.findById(id);

    if (!post) {
       throw new HttpError("Post not found", 404);
    }

    if(post.author?.toString() !== userId) {
        throw new HttpError("Not authorized to delete this post", 403);
    }

    await fileDAO.deleteMany({ postId: post.id });
    
    const postDeleted = await postDAO.delete(id);

    res.status(200).send({ success: true, message: "Post deleted successfully", data: postDeleted });
}

interface UpdatePostBody {
    title?: string;
    content?: string;
    tags?: string[];
}

export const updatePost: RequestHandler<HeaderId, Record<string, unknown>, UpdatePostBody> = async (req, res) => {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const author = req?.userId;

    if(!mongoose.isValidObjectId(id)) {
        throw new HttpError("Task Id not found", 404)
    } 

    else if(title && !title?.trim()) {
        throw new HttpError("Post must have a Title", 400)
    }

    const post = await postDAO.findById(id);

    if (!post) {
       throw new HttpError("Post not found", 404);
    }

    if(post.author?.toString() !== author) {
        throw new HttpError("Not authorized to delete this post", 403);
    }

    const postDTO = new PostDTO();
    if (title) postDTO.title = title;
    if (content !== undefined) postDTO.content = content;
    if (tags !== undefined) postDTO.tags = tags;

    const updatedPost = await postDAO.update(id, postDTO);

    if(!updatedPost) {
        throw new HttpError("Error updating post", 500)
    }

    res.status(201).send({ success: true, data: updatedPost, message: "Post updated successfully" });
}

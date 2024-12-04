import Post from "../models/post.model.js";
import {asyncWrapper} from "../middlewares/asyncWrapper.middleware.js";
import path from "path";
import fs from "fs";

const __dirname = path.resolve();

export const getPosts = asyncWrapper(async (request,response) => {
    const posts = await Post.find();
    response.status(200).send({success: true, data: posts});
});

export const createPost = asyncWrapper(async (request,response) => {
    const {title, content} = request.body;
    const file = request.file.path;
    const post = await Post.create({title, content, file});
    response.status(201).send({success: true, data: post});
});

export const downloadPost = asyncWrapper(async (request,response) => {
    const {id} = request.params;
    const post = await Post.findById(id);
    if(!post) {
        response.status(404).send({success: false, message: "Post not found"});
    }
    response.download(`${__dirname}/${post.file}`);
});

export const deletePost = asyncWrapper(async (request,response) => {
    const {id} = request.params;
    const post = await Post.findById(id);
    if (!post) {
        response.status(404).send({success: false, message: "Post not found"});
    }

    const filePath = path.join(__dirname, post.file);
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Error deleting file: ${err.message}`);
            return response.status(500).send({success: false, message: "Error deleting file"});
        }
    });

    await Post.findByIdAndDelete(id);
    response.status(200).send({success: true, message: "Post deleted successfully"});
});

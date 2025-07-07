import { Request, RequestHandler } from "express"
import { HttpError } from "../utils/httpError";
import { connectDB } from "../config/db";
import { v4 as uuidv4 } from 'uuid';

interface HeaderId {
    id: string;
}

export const downloadFile: RequestHandler<HeaderId> = async (req, res) => {
    const { id } = req.params;

    const connection = await connectDB();
    const [rows] = await connection.execute(
        `SELECT name, contentType, data FROM files WHERE id = ?`,
        [id]
    );
    const file = Array.isArray(rows) ? rows[0] : null;

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

    const connection = await connectDB();
    const [rows] = await connection.execute(
        `SELECT id, name, contentType, size, createdAt FROM files WHERE post_id = ?`,
        [postId]
    );
    const files = Array.isArray(rows) ? rows : [];
    
    if (files.length === 0) {
        throw new HttpError("Files not found", 404);
    }

    res.status(200).json({ 
        success: true, 
        message: "Files fetched successfully", 
        data: files.map(file => ({
            id: file.id,
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

    if (!postId) {
        throw new HttpError("Post postId is required", 400);
    }
    else if(!files || files.length === 0) {
        throw new HttpError("A file is required", 400);
    }
    
    const connection = await connectDB();

    const [postRows] = await connection.execute(
        `SELECT author_id FROM posts WHERE id = ?`,
        [postId]
    );
    const post = Array.isArray(postRows) ? postRows[0] : null;

    if(!post) {
        throw new HttpError("Post not found", 404);
    }
    else if(post.author_id !== userId) {
        throw new HttpError("Not authorized to add files to this post", 403);
    }
    
    try {
        await connection.beginTransaction();

        for (const file of files) {
            const fileId = uuidv4();
            await connection.execute(
                `INSERT INTO files (id, name, contentType, size, post_id, data) VALUES (?, ?, ?, ?, ?, ?)`,
                [fileId, file.originalname, file.mimetype, file.size.toString(), postId, file.buffer]
            );
        }

        await connection.commit();

        res.status(200).send({ success: true, message: "File successfully submitted" });

    } catch (error) {
        await connection.rollback();
        throw new HttpError("Error submitting files", 500);
    }
}

interface deleteFileHeader {
    postId: string;
    id: string;
}

export const deleteFile: RequestHandler<deleteFileHeader> = async (req, res) => {
    const { id, postId } = req.params;
    const userId = req?.userId;

    const connection = await connectDB();

    const [fileRows] = await connection.execute(
        `SELECT post_id FROM files WHERE id = ?`,
        [id]
    );
    const file = Array.isArray(fileRows) ? fileRows[0] : null;

    if (!file) {
        throw new HttpError("File not found", 404);
    }
    else if(file.post_id !== postId) {
        throw new HttpError("File don't associate to this post", 400);
    }
    
    const [postRows] = await connection.execute(
        `SELECT author_id FROM posts WHERE id = ?`,
        [postId]
    );
    const post = Array.isArray(postRows) ? postRows[0] : null;

    if(!post) {
        throw new HttpError("Post not found", 404);
    }
    else if(post.author_id !== userId) {
        throw new HttpError("Not authorized to delete files from this post", 403);
    }

    const [deleteResult] = await connection.execute(
        `DELETE FROM files WHERE id = ?`,
        [id]
    );

    if (Array.isArray(deleteResult) && deleteResult.affectedRows === 0) {
        throw new HttpError("File not deleted", 500);
    }

    res.status(200).json({ success: true, message: "File deleted successfully" });
}
import { RequestHandler } from "express";
import { HttpError } from "../utils/httpError";
import { connectDB } from "../config/db";
import { v4 as uuidv4 } from 'uuid';
import path from "path";

interface HeaderId {
    id: string;
}

export const getPosts: RequestHandler = async (req, res) => {
    const connection = await connectDB();
    const [rows] = await connection.execute(
        `SELECT id, title, content, author_id, author_nickname, createdAt, updatedAt
         FROM v_post_details`
    );
    let posts = Array.isArray(rows) ? rows : [];

    if(posts.length > 0) {
        const postIds = posts.map((post: any) => post.id);
        const placeholders = postIds.map(() => '?').join(',');
        const [fileRows] = await connection.execute(
            `SELECT id, name, contentType, size, filePath, post_id FROM files WHERE post_id IN (${placeholders})`,
            postIds
        );
        const files = Array.isArray(fileRows) ? fileRows.map((file: any) => ({
            ...file,
            fileUrl: `${req.protocol}://${req.get('host')}/uploads/${path.basename(file.filePath)}`
        })) : [];

        posts = posts.map((post: any) => ({
            ...post,
            files: files.filter((file: any) => file.post_id === post.id)
        }));
    }

    res.status(200).send({ success: true, data: posts, message: "Posts fetched successfully" });
}

export const getPostsById: RequestHandler<HeaderId> = async (req, res) => {
    const { id } = req.params;

    const connection = await connectDB();
    const [rows] = await connection.execute(
        `SELECT id, title, content, author_id, author_nickname, createdAt, updatedAt
         FROM v_post_details
         WHERE id = ?`,
        [id]
    );
    const post = Array.isArray(rows) ? rows[0] : null;

    if (!post) {
        throw new HttpError("Post not found", 404);
    }

    const [tagRows] = await connection.execute(
        `SELECT t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?`,
        [id]
    );
    const tags = Array.isArray(tagRows) ? tagRows.map((row: any) => row.name) : [];

    const [fileRows] = await connection.execute(
            `SELECT id, name, contentType, size, filePath FROM files WHERE post_id = ?`,
            [id]
        );
        const files = Array.isArray(fileRows) ? fileRows.map(file => ({
            ...file,
            fileUrl: `${req.protocol}://${req.get('host')}/uploads/${path.basename(file.filePath)}`
        })) : [];

    res.status(200).send({ success: true, data: { ...post, tags, files }, message: "Post fetched successfully" });
}

interface CreatePostBody {
    title: string;
    content?: string;
    tags?: string[];
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

    const connection = await connectDB();
    const postId = uuidv4();

    try {
        await connection.beginTransaction();

        await connection.execute(
            `INSERT INTO posts (id, title, content, author_id) VALUES (?, ?, ?, ?)`,
            [postId, title, content || null, author]
        );

        if (tags && tags.length > 0) {
            for (const tagName of tags) {
                let [tagRows] = await connection.execute(
                    `SELECT id FROM tags WHERE name = ?`,
                    [tagName]
                );
                let tagId;
                if (Array.isArray(tagRows) && tagRows.length > 0) {
                    tagId = tagRows[0].id;
                } else {
                    const [insertResult] = await connection.execute(
                        `INSERT INTO tags (name) VALUES (?)`,
                        [tagName]
                    );
                    tagId = (insertResult as any).insertId;
                }
                await connection.execute(
                    `INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)`,
                    [postId, tagId]
                );
            }
        }

        if (files && files.length > 0) {
            for (const file of files) {
                const fileId = uuidv4();
                await connection.execute(
                    `INSERT INTO files (id, name, contentType, size, post_id, filePath) VALUES (?, ?, ?, ?, ?, ?)`,
                    [fileId, file.originalname, file.mimetype, file.size.toString(), postId, file.path]
                );
            }
        }

        await connection.commit();

        const [postRows] = await connection.execute(
            `SELECT p.id, p.title, p.content, p.author_id, u.nickname as author_nickname, p.createdAt, p.updatedAt
             FROM posts p
             JOIN users u ON p.author_id = u.id
             WHERE p.id = ?`,
            [postId]
        );
        const newPost = Array.isArray(postRows) ? postRows[0] : null;

        res.status(201).send({ success: true, data: newPost, message: "Post created successfully" });

    } catch (error) {
        await connection.rollback();
        throw new HttpError("Error creating post", 500);
    }
}


export const deletePost: RequestHandler<HeaderId> = async (req, res) => {
    const { id } = req.params;
    const userId = req?.userId;

    if (!userId) {
        throw new HttpError("User not found", 404);
    }

    const connection = await connectDB();

    try {
        await connection.execute(
            `CALL sp_delete_post(?, ?)`,
            [id, userId]
        );

        res.status(200).send({ success: true, message: "Post deleted successfully" });

    } catch (error: any) {
        if (error.sqlState === '45000') {
            throw new HttpError(error.message, 400);
        }
        throw new HttpError("Error deleting post", 500);
    }
}

interface UpdatePostBody {
    title?: string;
    content?: string;
    tags?: string[];
}

export const updatePost: RequestHandler<HeaderId, {}, UpdatePostBody> = async (req, res) => {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const author = req?.userId;

    const connection = await connectDB();

    const [postRows] = await connection.execute(
        `SELECT author_id FROM posts WHERE id = ?`,
        [id]
    );
    const post = Array.isArray(postRows) ? postRows[0] : null;

    if (!post) {
       throw new HttpError("Post not found", 404);
    }

    if(post.author_id !== author) {
        throw new HttpError("Not authorized to update this post", 403);
    }

    try {
        await connection.beginTransaction();

        const updateFields: string[] = [];
        const updateValues: (string | null)[] = [];

        if (title !== undefined) {
            if (!title.trim()) {
                throw new HttpError("Post must have a Title", 400);
            }
            updateFields.push("title = ?");
            updateValues.push(title);
        }
        if (content !== undefined) {
            updateFields.push("content = ?");
            updateValues.push(content || null);
        }

        if (updateFields.length > 0) {
            const updateQuery = `UPDATE posts SET ${updateFields.join(', ')} WHERE id = ?`;
            updateValues.push(id);
            await connection.execute(updateQuery, updateValues);
        }

        if (tags !== undefined) {
            await connection.execute(
                `DELETE FROM post_tags WHERE post_id = ?`,
                [id]
            );
            if (tags.length > 0) {
                for (const tagName of tags) {
                    let [tagRows] = await connection.execute(
                        `SELECT id FROM tags WHERE name = ?`,
                        [tagName]
                    );
                    let tagId;
                    if (Array.isArray(tagRows) && tagRows.length > 0) {
                        tagId = tagRows[0].id;
                    } else {
                        const [insertResult] = await connection.execute(
                            `INSERT INTO tags (name) VALUES (?)`,
                            [tagName]
                        );
                        tagId = (insertResult as any).insertId;
                    }
                    await connection.execute(
                        `INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)`,
                        [id, tagId]
                    );
                }
            }
        }

        await connection.commit();

        const [updatedPostRows] = await connection.execute(
            `SELECT p.id, p.title, p.content, p.author_id, u.nickname as author_nickname, p.createdAt, p.updatedAt
             FROM posts p
             JOIN users u ON p.author_id = u.id
             WHERE p.id = ?`,
            [id]
        );
        const updatedPost = Array.isArray(updatedPostRows) ? updatedPostRows[0] : null;

        res.status(201).send({ success: true, data: updatedPost, message: "Post updated successfully" });

    } catch (error) {
        await connection.rollback();
        throw new HttpError("Error updating post", 500);
    }
}
import { RequestHandler } from "express";
import { HttpError } from "../utils/httpError";
import { UserDegreeType } from "../models/user.model";
import { connectDB } from "../config/db";
import { fileTypeFromBuffer } from "file-type";

interface HeaderId {
    userId: string;
}

interface HeaderNickname {
    nickname: string;
}

export const getUserById: RequestHandler<HeaderId> = async (req, res) => {
    const { userId } = req.params;

    const connection = await connectDB();
    const [rows] = await connection.execute(
        `SELECT u.id, u.nickname, u.verified, u.picture, d.name AS degree, u.createdAt, u.updatedAt 
         FROM users u
         LEFT JOIN degrees d ON u.degree_id = d.id
         WHERE u.id = ?`,
        [userId]
    );
    const user = Array.isArray(rows) ? rows[0] : null;

    if (!user) {
        throw new HttpError("User not found", 404);
    }

    res.status(201).json({ success: true , data: user, message: "User fetched successfully" })
}

export const getUserByNickname: RequestHandler<HeaderNickname> = async (req, res) => {
    const { nickname } = req.params;

    const connection = await connectDB();
    const [rows] = await connection.execute(
        `SELECT u.id, u.nickname, u.verified, u.picture, d.name AS degree, u.createdAt, u.updatedAt 
         FROM users u
         LEFT JOIN degrees d ON u.degree_id = d.id
         WHERE u.nickname = ?`,
        [nickname]
    );
    const user = Array.isArray(rows) ? rows[0] : null;

    if(!user) {
        throw new HttpError("User not found", 404);
    }

    res.status(201).json({ success: true , data: user, message: "User fetched successfully" })
}


export const getUserPostsById: RequestHandler<HeaderId> = async (req, res) => {
    const { userId } = req.params;

    const connection = await connectDB();
    const [userRows] = await connection.execute(
        `SELECT id, nickname FROM users WHERE id = ?`,
        [userId]
    );
    const user = Array.isArray(userRows) ? userRows[0] : null;

    if (!user) {
        throw new HttpError("User not found", 404);
    }

    const [postRows] = await connection.execute(
        `SELECT * FROM posts WHERE author_id = ?`,
        [user.id]
    );
    const posts = Array.isArray(postRows) ? postRows : [];

    if (posts.length === 0) {
        return res.status(200).send({ success: true, data: [], message: "Posts fetched successfully" });
    }

    res.status(200).send({ success: true, data: posts, message: "Posts fetched successfully" });
}

export const getUserPostsByNickname: RequestHandler<HeaderNickname> = async (req, res) => {
    const { nickname } = req.params;

    const connection = await connectDB();
    const [userRows] = await connection.execute(
        `SELECT id FROM users WHERE nickname = ?`,
        [nickname]
    );
    const user = Array.isArray(userRows) ? userRows[0] : null;

    if(!user) {
        throw new HttpError("User not found", 404);
    }

    const [postRows] = await connection.execute(
        `SELECT * FROM posts WHERE author_id = ?`,
        [user.id]
    );
    const posts = Array.isArray(postRows) ? postRows : [];

    if (posts.length === 0) {
        return res.status(200).send({ success: true, data: [], message: "Posts fetched successfully" });
    }

    res.status(200).send({ success: true, data: posts, message: "Posts fetched successfully" });
}

interface UpdateMeBody {
    nickname?: string;
    degree?: UserDegreeType;
}

export const updateMe: RequestHandler<{}, {}, UpdateMeBody> = async (req, res) => {
    const { nickname, degree } = req.body
    const userId = req?.userId
    const file: Express.Multer.File = req.file as Express.Multer.File

    const connection = await connectDB();

    const [userRows] = await connection.execute(
        `SELECT * FROM users WHERE id = ?`,
        [userId]
    );
    const user = Array.isArray(userRows) ? userRows[0] : null;

    if (!user) {
        throw new HttpError("User not found", 404)
    }

    if(nickname && nickname !== user.nickname) {
        const [existingNicknameRows] = await connection.execute(
            `SELECT id FROM users WHERE nickname = ?`,
            [nickname]
        );
        if (Array.isArray(existingNicknameRows) && existingNicknameRows.length > 0) {
            throw new HttpError("Nickname already exists!", 400)
        }
    }

    let degreeId: number | null = null;
    if (degree) {
        const [degreeRows] = await connection.execute(
            `SELECT id FROM degrees WHERE name = ?`,
            [degree]
        );
        if (Array.isArray(degreeRows) && degreeRows.length > 0) {
            degreeId = degreeRows[0].id;
        } else {
            throw new HttpError("Degree not valid", 400);
        }
    }

    const updateFields: string[] = [];
    const updateValues: (string | Buffer | number | null)[] = [];

    if (nickname) {
        updateFields.push("nickname = ?");
        updateValues.push(nickname);
    }
    if (degreeId !== null) {
        updateFields.push("degree_id = ?");
        updateValues.push(degreeId);
    }
    if (file) {
        updateFields.push("picture = ?");
        updateValues.push(file.buffer);
    }

    if (updateFields.length === 0) {
        return res.status(200).json({ success: true, message: "No changes to apply." });
    }

    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(userId);

    const [updateResult] = await connection.execute(updateQuery, updateValues);

    if (Array.isArray(updateResult) && updateResult.affectedRows === 0) {
        throw new HttpError("Failed to update user", 500);
    }

    const [updatedUserRows] = await connection.execute(
        `SELECT u.id, u.nickname, u.verified, u.picture, d.name AS degree, u.createdAt, u.updatedAt 
         FROM users u
         LEFT JOIN degrees d ON u.degree_id = d.id
         WHERE u.id = ?`,
        [userId]
    );
    const updatedUser = Array.isArray(updatedUserRows) ? updatedUserRows[0] : null;

    res.status(201).json({ success: true, message: "User updated successfully!", data: updatedUser })
}

export const getMe: RequestHandler = async (req, res) => {
    const userId = req?.userId

    const connection = await connectDB();
    const [rows] = await connection.execute(
        `SELECT u.id, u.nickname, u.verified, u.picture, d.name AS degree, u.createdAt, u.updatedAt 
         FROM users u
         LEFT JOIN degrees d ON u.degree_id = d.id
         WHERE u.id = ?`,
        [userId]
    );
    const user = Array.isArray(rows) ? rows[0] : null;

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
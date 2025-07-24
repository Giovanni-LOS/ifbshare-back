import { RequestHandler } from "express";
import { UserDegreeType } from "../models/user.model";

export interface HeaderId {
    userId: string;
}

export interface HeaderNickname {
    nickname: string;
}

export interface UpdateMeBody {
    nickname: string;
    degree: UserDegreeType;
}

export interface IUserController {
    getUserById: RequestHandler<HeaderId, Record<string, unknown>, Record<string, unknown>>;
    getUserByNickname: RequestHandler<HeaderNickname, Record<string, unknown>, Record<string, unknown>>;
    getUserPostsById: RequestHandler<HeaderId, Record<string, unknown>, Record<string, unknown>>;
    getUserPostsByNickname: RequestHandler<HeaderNickname>;
    updateMe: RequestHandler<Record<string, unknown>, Record<string, unknown>, UpdateMeBody>;
    getMe: RequestHandler<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>;
}

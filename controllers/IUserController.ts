import { RequestHandler } from "express";
import { UserDegreeType } from "../models/user.model";

interface UserHeaderId {
    userId: string;
}

interface UserHeaderNickname {
    nickname: string;
}

interface UpdateMeBody {
    nickname: string;
    degree: UserDegreeType;
}

export interface IUserController {
    getUserById: RequestHandler<UserHeaderId, Record<string, unknown>, Record<string, unknown>>;
    getUserByNickname: RequestHandler<UserHeaderNickname, Record<string, unknown>, Record<string, unknown>>;
    getUserPostsById: RequestHandler<UserHeaderId, Record<string, unknown>, Record<string, unknown>>;
    getUserPostsByNickname: RequestHandler<UserHeaderNickname>;
    updateMe: RequestHandler<Record<string, unknown>, Record<string, unknown>, UpdateMeBody>;
    getMe: RequestHandler<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>;
}

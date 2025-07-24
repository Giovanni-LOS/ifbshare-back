import { RequestHandler } from "express";

export interface HeaderId {
    id: string;
}

export interface getFilesHeader {
    postId: string;
}

export interface PostFileParams {
    postId: string;
}

export interface deleteFileHeader {
    postId: string;
    id: string;
}

export interface IFileController {
    downloadFile: RequestHandler<HeaderId, Record<string, unknown>, Record<string, unknown>>;
    getFiles: RequestHandler<getFilesHeader, Record<string, unknown>, Record<string, unknown>>;
    postFile: RequestHandler<PostFileParams, Record<string, unknown>, Record<string, unknown>>;
    deleteFile: RequestHandler<deleteFileHeader, Record<string, unknown>, Record<string, unknown>>;
}

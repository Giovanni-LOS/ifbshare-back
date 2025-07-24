import { RequestHandler } from "express";

interface FileHeaderId {
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

export interface IFileController {
    downloadFile: RequestHandler<FileHeaderId, Record<string, unknown>, Record<string, unknown>>;
    getFiles: RequestHandler<getFilesHeader, Record<string, unknown>, Record<string, unknown>>;
    postFile: RequestHandler<PostFileParams, Record<string, unknown>, Record<string, unknown>>;
    deleteFile: RequestHandler<deleteFileHeader, Record<string, unknown>, Record<string, unknown>>;
}

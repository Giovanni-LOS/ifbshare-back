import { RequestHandler } from "express";

export interface HeaderId {
    id: string;
}

export interface CreatePostBody {
    title: string;
    content: string;
    tags: string[];
}

export interface UpdatePostBody {
    title?: string;
    content?: string;
    tags?: string[];
}

export interface IPostController {
    getPosts: RequestHandler<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>;
    getPostsById: RequestHandler<HeaderId, Record<string, unknown>, Record<string, unknown>>;
    createPost: RequestHandler<Record<string, unknown>, Record<string, unknown>, CreatePostBody>;
    deletePost: RequestHandler<HeaderId, Record<string, unknown>, Record<string, unknown>>;
    updatePost: RequestHandler<HeaderId, Record<string, unknown>, UpdatePostBody>;
}

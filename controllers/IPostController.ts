import { RequestHandler } from "express";

interface HeaderId {
    id: string;
}

interface CreatePostBody {
    title: string;
    content: string;
    tags: string[];
}

interface UpdatePostBody {
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

import { IPostDAO } from "./IPostDAO";
import postModel from "../../models/post.model";
import { PostDTO } from "../persistence/PostDTO";
import { Types } from "mongoose";

class PostDAO_Mongoose implements IPostDAO {
    private convertToDTO(postObj: Record<string, unknown>): PostDTO {
        return {
            id: (postObj._id as Types.ObjectId).toString(),
            title: postObj.title as string,
            content: postObj.content as string,
            author: (postObj.author as Types.ObjectId).toString(),
            tags: postObj.tags as string[] || [],
            createdAt: postObj.createdAt as Date,
            updatedAt: postObj.updatedAt as Date
        } as PostDTO;
    }

    async save(post: PostDTO): Promise<PostDTO> {
        const newPost = new postModel(post);
        const savedPost = await newPost.save();
        return this.convertToDTO(savedPost.toObject());
    }

    async findById(id: string): Promise<PostDTO | null> {
        const post = await postModel.findById(id);
        return post ? this.convertToDTO(post.toObject()) : null;
    }

    async findAll(): Promise<PostDTO[]> {
        const posts = await postModel.find();
        return posts.map(post => this.convertToDTO(post.toObject()));
    }

    async findAllByUsuarioId(userId: string): Promise<PostDTO[]> {
        const posts = await postModel.find({ author: userId });
        return posts.map(post => this.convertToDTO(post.toObject()));
    }

    async delete(id: string): Promise<void> {
        await postModel.findByIdAndDelete(id);
    }

    async update(id: string, post: PostDTO): Promise<PostDTO | null> {
        const updatedPost = await postModel.findByIdAndUpdate(id, post, { new: true });
        return updatedPost ? this.convertToDTO(updatedPost.toObject()) : null;
    }
}

export default PostDAO_Mongoose;
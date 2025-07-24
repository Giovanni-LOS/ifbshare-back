import { IPostDAO } from "./IPostDAO";
import postModel from "../../models/post.model";
import { PostDTO } from "../persistence/PostDTO";

class PostDAO_Mongoose implements IPostDAO {
    async save(post: PostDTO): Promise<PostDTO> {
        const newPost = new postModel(post);
        const savedPost = await newPost.save();
        return savedPost.toJSON() as PostDTO;
    }

    async findById(id: string): Promise<PostDTO | null> {
        const post = await postModel.findById(id);
        return post ? post.toJSON() as PostDTO : null;
    }

    async findAll(): Promise<PostDTO[]> {
        const posts = await postModel.find();
        return posts.map(post => post.toJSON() as PostDTO);
    }

    async findAllByUsuarioId(userId: string): Promise<PostDTO[]> {
        const posts = await postModel.find({ author: userId });
        return posts.map(post => post.toJSON() as PostDTO);
    }

    async delete(id: string): Promise<void> {
        await postModel.findByIdAndDelete(id);
    }

    async update(id: string, post: PostDTO): Promise<PostDTO | null> {
        const updatedPost = await postModel.findByIdAndUpdate(id, post, { new: true });
        return updatedPost ? updatedPost.toJSON() as PostDTO : null;
    }
}

export default PostDAO_Mongoose;
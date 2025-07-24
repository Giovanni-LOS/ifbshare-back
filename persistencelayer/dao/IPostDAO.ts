import { PostDTO } from "../persistence/PostDTO";

export interface IPostDAO {
    save(post: PostDTO): Promise<PostDTO>;
    findById(id: string): Promise<PostDTO | null>;
    findAll(): Promise<PostDTO[]>;
    findAllByUsuarioId(userId: string): Promise<PostDTO[]>;
    delete(id: string): Promise<void>;
}
import { FileDTO } from "../persistence/FileDTO";

export interface IFileDAO {
    save(file: FileDTO): Promise<FileDTO>;
    insertMany(files: FileDTO[]): Promise<FileDTO[]>;
    deleteMany(query: Record<string, unknown>): Promise<void>;
    findByPostId(postId: string): Promise<FileDTO[]>;
    findById(id: string): Promise<FileDTO | null>;
    delete(id: string): Promise<void>;
}
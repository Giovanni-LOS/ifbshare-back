import fileModel from "../../models/file.model";
import { FileDTO } from "../persistence/FileDTO";
import { IFileDAO } from "./IFileDAO";

export default class FileDAO_Mongoose implements IFileDAO {
    async save(fileDTO: FileDTO): Promise<FileDTO> {
        const newFile = await fileModel.create({
            filename: fileDTO.filename,
            mimetype: fileDTO.mimetype,
            size: fileDTO.size,
            url: fileDTO.url,
            postId: fileDTO.postId,
        });
        fileDTO.id = newFile._id;
        return fileDTO;
    }

    async insertMany(fileDTOs: FileDTO[]): Promise<FileDTO[]> {
        const newFiles = await fileModel.insertMany(fileDTOs.map(fileDTO => ({
            filename: fileDTO.filename,
            mimetype: fileDTO.mimetype,
            size: fileDTO.size,
            url: fileDTO.url,
            postId: fileDTO.postId,
        })));
        return newFiles.map(file => {
            const fileDTO = new FileDTO();
            fileDTO.id = file._id;
            fileDTO.filename = file.filename;
            fileDTO.mimetype = file.mimetype;
            fileDTO.size = file.size;
            fileDTO.url = file.url;
            fileDTO.postId = file.postId;
            return fileDTO;
        });
    }

    async deleteMany(query: Record<string, unknown>): Promise<void> {
        await fileModel.deleteMany(query);
    }

    async findByPostId(postId: string): Promise<FileDTO[]> {
        const files = await fileModel.find({ postId });
        return files.map(file => {
            const fileDTO = new FileDTO();
            fileDTO.id = file._id;
            fileDTO.filename = file.filename;
            fileDTO.mimetype = file.mimetype;
            fileDTO.size = file.size;
            fileDTO.url = file.url;
            fileDTO.postId = file.postId;
            return fileDTO;
        });
    }
}

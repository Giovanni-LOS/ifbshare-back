import fileModel from "../../models/file.model";
import { FileDTO } from "../persistence/FileDTO";
import { IFileDAO } from "./IFileDAO";
import { Types } from "mongoose";

export default class FileDAO_Mongoose implements IFileDAO {
    private convertToDTO(fileObj: Record<string, unknown>): FileDTO {
        return {
            id: (fileObj._id as Types.ObjectId).toString(),
            name: fileObj.name as string,
            contentType: fileObj.contentType as string,
            size: fileObj.size as string,
            postId: (fileObj.postId as Types.ObjectId).toString(),
            data: fileObj.data as Buffer,
            createdAt: fileObj.createdAt as Date,
            updatedAt: fileObj.updatedAt as Date
        } as FileDTO;
    }

    async save(fileDTO: FileDTO): Promise<FileDTO> {
        const newFile = new fileModel({
            name: fileDTO.name,
            contentType: fileDTO.contentType,
            size: fileDTO.size,
            postId: fileDTO.postId,
            data: fileDTO.data,
        });
        const savedFile = await newFile.save();
        return this.convertToDTO(savedFile.toObject());
    }

    async insertMany(fileDTOs: FileDTO[]): Promise<FileDTO[]> {
        const newFiles = await fileModel.insertMany(fileDTOs.map(fileDTO => ({
            name: fileDTO.name,
            contentType: fileDTO.contentType,
            size: fileDTO.size,
            postId: fileDTO.postId,
            data: fileDTO.data,
        })));
        return newFiles.map(file => this.convertToDTO(file.toObject()));
    }

    async deleteMany(query: Record<string, unknown>): Promise<void> {
        await fileModel.deleteMany(query);
    }

    async findByPostId(postId: string): Promise<FileDTO[]> {
        const files = await fileModel.find({ postId });
        return files.map(file => this.convertToDTO(file.toObject()));
    }

    async findById(id: string): Promise<FileDTO | null> {
        const file = await fileModel.findById(id);
        return file ? this.convertToDTO(file.toObject()) : null;
    }

    async delete(id: string): Promise<void> {
        await fileModel.findByIdAndDelete(id);
    }
}

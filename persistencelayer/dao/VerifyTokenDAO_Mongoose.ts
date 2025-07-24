import verifyTokenModel, { VerifyTokenType } from "../../models/verifyToken.model";
import { VerifyTokenDTO } from "../persistence/VerifyTokenDTO";
import { IVerifyTokenDAO } from "./IVerifyTokenDAO";
import { Types } from "mongoose";

export default class VerifyTokenDAO_Mongoose implements IVerifyTokenDAO {
    private convertToDTO(tokenObj: Record<string, unknown>): VerifyTokenDTO {
        return {
            id: (tokenObj._id as Types.ObjectId).toString(),
            email: tokenObj.email as string,
            token: tokenObj.token as string,
            expiresAt: tokenObj.expiresAt as Date,
            type: tokenObj.type as VerifyTokenType,
            verified: tokenObj.verified as boolean,
            createdAt: tokenObj.createdAt as Date,
            updatedAt: tokenObj.updatedAt as Date
        } as VerifyTokenDTO;
    }

    async save(verifyTokenDTO: VerifyTokenDTO): Promise<VerifyTokenDTO> {
        const newVerifyToken = new verifyTokenModel({
            email: verifyTokenDTO.email,
            token: verifyTokenDTO.token,
            expiresAt: verifyTokenDTO.expiresAt,
            type: verifyTokenDTO.type,
            verified: verifyTokenDTO.verified
        });
        const savedToken = await newVerifyToken.save();
        return this.convertToDTO(savedToken.toObject());
    }

    async findById(id: string): Promise<VerifyTokenDTO | null> {
        const verifyToken = await verifyTokenModel.findById(id);
        return verifyToken ? this.convertToDTO(verifyToken.toObject()) : null;
    }

    async findByEmail(email: string): Promise<VerifyTokenDTO | null> {
        const verifyToken = await verifyTokenModel.findOne({ email });
        return verifyToken ? this.convertToDTO(verifyToken.toObject()) : null;
    }

    async findByIdAndDelete(id: string): Promise<VerifyTokenDTO | null> {
        const verifyToken = await verifyTokenModel.findByIdAndDelete(id);
        return verifyToken ? this.convertToDTO(verifyToken.toObject()) : null;
    }

    async findOne(query: Record<string, unknown>): Promise<VerifyTokenDTO | null> {
        const verifyToken = await verifyTokenModel.findOne(query);
        return verifyToken ? this.convertToDTO(verifyToken.toObject()) : null;
    }
}

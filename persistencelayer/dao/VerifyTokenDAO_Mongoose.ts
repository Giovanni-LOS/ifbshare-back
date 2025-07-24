import verifyTokenModel from "../../models/verifyToken.model";
import { VerifyTokenDTO } from "../persistence/VerifyTokenDTO";
import { IVerifyTokenDAO } from "./IVerifyTokenDAO";

export default class VerifyTokenDAO_Mongoose implements IVerifyTokenDAO {
    async save(verifyTokenDTO: VerifyTokenDTO): Promise<VerifyTokenDTO> {
        const newVerifyToken = await verifyTokenModel.create({
            email: verifyTokenDTO.email,
            expiresAt: verifyTokenDTO.expiresAt,
            type: verifyTokenDTO.type,
            verified: verifyTokenDTO.verified
        });
        verifyTokenDTO.id = newVerifyToken._id;
        return verifyTokenDTO;
    }

    async findById(id: string): Promise<VerifyTokenDTO | null> {
        const verifyToken = await verifyTokenModel.findById(id);
        if (!verifyToken) return null;
        const verifyTokenDTO = new VerifyTokenDTO();
        verifyTokenDTO.id = verifyToken._id;
        verifyTokenDTO.email = verifyToken.email;
        verifyTokenDTO.expiresAt = verifyToken.expiresAt;
        verifyTokenDTO.type = verifyToken.type;
        verifyTokenDTO.verified = verifyToken.verified;
        return verifyTokenDTO;
    }

    async findByEmail(email: string): Promise<VerifyTokenDTO | null> {
        const verifyToken = await verifyTokenModel.findOne({ email });
        if (!verifyToken) return null;
        const verifyTokenDTO = new VerifyTokenDTO();
        verifyTokenDTO.id = verifyToken._id;
        verifyTokenDTO.email = verifyToken.email;
        verifyTokenDTO.expiresAt = verifyToken.expiresAt;
        verifyTokenDTO.type = verifyToken.type;
        verifyTokenDTO.verified = verifyToken.verified;
        return verifyTokenDTO;
    }

    async findByIdAndDelete(id: string): Promise<VerifyTokenDTO | null> {
        const verifyToken = await verifyTokenModel.findByIdAndDelete(id);
        if (!verifyToken) return null;
        const verifyTokenDTO = new VerifyTokenDTO();
        verifyTokenDTO.id = verifyToken._id;
        verifyTokenDTO.email = verifyToken.email;
        verifyTokenDTO.expiresAt = verifyToken.expiresAt;
        verifyTokenDTO.type = verifyToken.type;
        verifyTokenDTO.verified = verifyToken.verified;
        return verifyTokenDTO;
    }

    async findOne(query: Record<string, unknown>): Promise<VerifyTokenDTO | null> {
        const verifyToken = await verifyTokenModel.findOne(query);
        if (!verifyToken) return null;
        const verifyTokenDTO = new VerifyTokenDTO();
        verifyTokenDTO.id = verifyToken._id;
        verifyTokenDTO.email = verifyToken.email;
        verifyTokenDTO.expiresAt = verifyToken.expiresAt;
        verifyTokenDTO.type = verifyToken.type;
        verifyTokenDTO.verified = verifyToken.verified;
        return verifyTokenDTO;
    }
}

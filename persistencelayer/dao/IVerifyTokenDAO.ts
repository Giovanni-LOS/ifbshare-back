import { VerifyTokenDTO } from "../persistence/VerifyTokenDTO";

export interface IVerifyTokenDAO {
    save(verifyToken: VerifyTokenDTO): Promise<VerifyTokenDTO>;
    findById(id: string): Promise<VerifyTokenDTO | null>;
    findByEmail(email: string): Promise<VerifyTokenDTO | null>;
    findByIdAndDelete(id: string): Promise<VerifyTokenDTO | null>;
    findOne(query: Record<string, unknown>): Promise<VerifyTokenDTO | null>;
}
import { VerifyTokenType } from "../../models/verifyToken.model";

export class VerifyTokenDTO {
    id?: string;
    email!: string;
    token?: string;
    expiresAt!: Date;
    type!: VerifyTokenType;
    verified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
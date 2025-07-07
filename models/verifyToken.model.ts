export enum VerifyTokenType {
    EMAIL = "email",
    PASSWORD_RESET = "password_reset",
}

export interface VerifyToken {
    id: string;
    email: string;
    expiresAt: Date;
    type: VerifyTokenType;
    createdAt: Date;
    updatedAt: Date;
}
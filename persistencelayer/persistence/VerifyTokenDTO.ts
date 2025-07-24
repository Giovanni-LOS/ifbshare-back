export class VerifyTokenDTO {
    id?: string;
    email?: string;
    token?: string;
    expiresAt?: Date;
    type?: string;
    verified?: boolean;
}
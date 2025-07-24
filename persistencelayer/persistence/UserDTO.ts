import { UserDegreeType } from "../../models/user.model";

export class UserDTO {
    id?: string;
    nickname!: string;
    email!: string;
    verified?: boolean;
    degree?: UserDegreeType;
    picture?: string; // Base64 encoded string
    createdAt?: Date;
    updatedAt?: Date;
}
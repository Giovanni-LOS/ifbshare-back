export enum UserDegreeType {
    CS = "Computer Science",
    PHYSICS = "Physics"
}

export interface User {
    id: string;
    nickname: string;
    email: string;
    password?: string;
    verified: boolean;
    picture?: Buffer;
    degree_id?: number;
    createdAt: Date;
    updatedAt: Date;
}
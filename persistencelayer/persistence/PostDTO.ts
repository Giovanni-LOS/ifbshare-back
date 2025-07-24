export class PostDTO {
    id?: string;
    title!: string;
    content?: string;
    author!: string; // ObjectId as string
    tags?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
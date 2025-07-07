export interface File {
    id: string;
    name: string;
    contentType: string;
    size: string;
    post_id: string;
    data: Buffer;
    createdAt: Date;
    updatedAt: Date;
}
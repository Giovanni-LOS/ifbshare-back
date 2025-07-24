export class FileDTO {
    id?: string;
    name?: string; // Changed from filename to match model
    contentType?: string; // Changed from mimetype to match model
    size?: string; // Keep as string to match model (though this should probably be number)
    postId?: string; // ObjectId as string
    data?: Buffer; // File data as Buffer
    createdAt?: Date;
    updatedAt?: Date;
}
import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req: Request,file: Express.Multer.File, cb: FileFilterCallback): void => {
    // Reject a file if it's not a jpg, png, or pdf
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "application/pdf"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 15, // 15 MB
    },
    fileFilter: fileFilter,
});

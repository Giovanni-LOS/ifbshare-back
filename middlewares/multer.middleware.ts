import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..'); // Go up one level from middlewares to ifbshare-back
const uploadDir = path.join(projectRoot, 'public', 'uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
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

const pictureFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    // Reject a file if it's not a jpg, png
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

export const uploadPicture = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1, // 1 MB
    },
    fileFilter: pictureFilter,
});




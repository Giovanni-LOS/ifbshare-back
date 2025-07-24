import express, { Router, RequestHandler } from "express"
import { authenticate } from "../middlewares/auth.middleware";

import FileController from "../controllers/FileController";
import { upload } from "../middlewares/multer.middleware";

import { IFileRoutes } from "./IFileRoute";

class FileRoutes implements IFileRoutes {
    public router: Router;
    public fileController: FileController;

    constructor() {
        this.router = express.Router();
        this.fileController = new FileController();
        this.configureRoutes();
    }

    public configureRoutes(): void {
        this.router.use(authenticate)
        /**
         * @swagger
         * tags:
         *   name: Files
         *   description: File management routes
         */
        /**
         * @swagger
         * /api/files/{postId}:
         *   get:
         *     summary: Get all files for a post
         *     tags: [Files]
         *     parameters:
         *       - in: path
         *         name: postId
         *         schema:
         *           type: string
         *         required: true
         *         description: Post ID
         *     responses:
         *       200:
         *         description: List of files
         *       400:
         *         description: Invalid post ID
         *       404:
         *         description: Files not found
         */
        this.router.get("/:postId", this.fileController.getFiles as unknown as RequestHandler);
        /**
         * @swagger
         * /api/files/{postId}:
         *   post:
         *     summary: Upload files to a post
         *     tags: [Files]
         *     parameters:
         *       - in: path
         *         name: postId
         *         schema:
         *           type: string
         *         required: true
         *         description: Post ID
         *     requestBody:
         *       required: true
         *       content:
         *         multipart/form-data:
         *           schema:
         *             type: object
         *             properties:
         *               file:
         *                 type: array
         *                 items:
         *                   type: string
         *                   format: binary
         *     responses:
         *       200:
         *         description: Files uploaded successfully
         *       400:
         *         description: Invalid post ID or no files provided
         *       403:
         *         description: Not authorized to add files to this post
         *       404:
         *         description: Post not found
         *       500:
         *         description: Error submitting files
         */
        this.router.post("/:postId", upload.array("file"), this.fileController.postFile as unknown as RequestHandler);
        /**
         * @swagger
         * /api/files/download/{id}:
         *   get:
         *     summary: Download a file
         *     tags: [Files]
         *     parameters:
         *       - in: path
         *         name: id
         *         schema:
         *           type: string
         *         required: true
         *         description: File ID
         *     responses:
         *       200:
         *         description: File downloaded successfully
         *       404:
         *         description: File not found
         */
        this.router.get("/download/:id", this.fileController.downloadFile);
        /**
         * @swagger
         * /api/files/{postId}/{id}:
         *   delete:
         *     summary: Delete a file from a post
         *     tags: [Files]
         *     parameters:
         *       - in: path
         *         name: postId
         *         schema:
         *           type: string
         *         required: true
         *         description: Post ID
         *       - in: path
         *         name: id
         *         schema:
         *           type: string
         *         required: true
         *         description: File ID
         *     responses:
         *       200:
         *         description: File deleted successfully
         *       400:
         *         description: File does not associate with this post
         *       403:
         *         description: Not authorized to delete files from this post
         *       404:
         *         description: File or post not found
         *       500:
         *         description: Error deleting file
         */
        this.router.delete("/:postId/:id", this.fileController.deleteFile as unknown as RequestHandler);
    }
}

export default new FileRoutes().router;
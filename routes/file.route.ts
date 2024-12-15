import express from "express"
import { authenticate } from "../middlewares/auth.middleware";
import { downloadFile, getFiles, postFile, deleteFile } from "../controllers/file.controller";
import { upload } from "../middlewares/multer.middleware";

const router = express.Router()

router.use(authenticate)
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
router.get("/:postId", getFiles);
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
router.post("/:postId", upload.array("file"), postFile);
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
router.get("/download/:id", downloadFile);
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
router.delete("/:postId/:id", deleteFile);

export default router;
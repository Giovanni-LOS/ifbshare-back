import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getMe, getUserById, getUserByNickname, getUserPostsById, getUserPostsByNickname, updateMe } from "../controllers/user.controller";
import { uploadPicture } from "../middlewares/multer.middleware";

const router = express.Router();

router.use(authenticate);
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management routes
 */
/**
 * @swagger
 * /api/users/profile/id/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.get("/profile/id/:userId", getUserById);
/**
 * @swagger
 * /api/users/profile/nickname/{nickname}:
 *   get:
 *     summary: Get user by nickname
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: nickname
 *         schema:
 *           type: string
 *         required: true
 *         description: User nickname
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       404:
 *         description: User not found
 */
router.get("/profile/nickname/:nickname", getUserByNickname);
/**
 * @swagger
 * /api/users/profile/id/{userId}/posts:
 *   get:
 *     summary: Get posts by user ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Posts fetched successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User or posts not found
 */
router.get("/profile/id/:userId/posts", getUserPostsById);
/**
 * @swagger
 * /api/users/profile/nickname/{nickname}/posts:
 *   get:
 *     summary: Get posts by user nickname
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: nickname
 *         schema:
 *           type: string
 *         required: true
 *         description: User nickname
 *     responses:
 *       200:
 *         description: Posts fetched successfully
 *       404:
 *         description: User or posts not found
 */
router.get("/profile/nickname/:nickname/posts", getUserPostsByNickname);
/**
 * @swagger
 * /api/users/profile/settings:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *               degree:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 */
router.put("/profile/settings", uploadPicture.single("file"), updateMe);
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       400:
 *         description: Invalid credentials
 */
router.get("/profile", authenticate, getMe);

export default router;

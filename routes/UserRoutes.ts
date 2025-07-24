import express, { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

import UserController from "../controllers/UserController";
import { uploadPicture } from "../middlewares/multer.middleware";

import { IUserRoutes } from "./IUserRoute";

class UserRoutes implements IUserRoutes {
    public router: Router;
    public userController: UserController;

    constructor() {
        this.router = express.Router();
        this.userController = new UserController();
        this.configureRoutes();
    }

    public configureRoutes(): void {
        this.router.use(authenticate);
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
        this.router.get("/profile/id/:userId", this.userController.getUserById);
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
        this.router.get("/profile/nickname/:nickname", this.userController.getUserByNickname);
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
        this.router.get("/profile/id/:userId/posts", this.userController.getUserPostsById);
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
        this.router.get("/profile/nickname/:nickname/posts", this.userController.getUserPostsByNickname);
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
        this.router.put("/profile/settings", uploadPicture.single("file"), this.userController.updateMe);
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
        this.router.get("/profile", authenticate, this.userController.getMe);
    }
}

export default new UserRoutes().router;
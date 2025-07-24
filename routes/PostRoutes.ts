import express, { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

import PostController from "../controllers/PostController";
import { authenticate } from "../middlewares/auth.middleware.js";

import { IPostRoutes } from "./IPostRoute";

class PostRoutes implements IPostRoutes {
    public router: Router;
    public postController: PostController;

    constructor() {
        this.router = express.Router();
        this.postController = new PostController();
        this.configureRoutes();
    }

    public configureRoutes(): void {
        this.router.use(authenticate);
        /**
         * @swagger
         * tags:
         *   name: Posts
         *   description: Post management routes
         */

        /**
         * @swagger
         * /api/posts:
         *   get:
         *     summary: Get all posts
         *     tags: [Posts]
         *     responses:
         *       200:
         *         description: List of posts
         *       401:
         *         description: Unauthorized
         */
        this.router.get( "/", this.postController.getPosts);
        /**
         * @swagger
         * /api/posts/{id}:
         *   get:
         *     summary: Get post by ID
         *     tags: [Posts]
         *     parameters:
         *       - in: path
         *         name: id
         *         schema:
         *           type: string
         *         required: true
         *         description: Post ID
         *     responses:
         *       200:
         *         description: Post fetched successfully
         *       401:
         *         description: Unauthorized
         *       404:
         *         description: Post not found
         */
        this.router.get( "/:id", this.postController.getPostsById);
        /**
         * @swagger
         * /api/posts:
         *   post:
         *     summary: Create a new post
         *     tags: [Posts]
         *     requestBody:
         *       required: true
         *       content:
         *         multipart/form-data:
         *           schema:
         *             type: object
         *             properties:
         *               title:
         *                 type: string
         *               content:
         *                 type: string
         *               tags:
         *                 type: array
         *                 items:
         *                   type: string
         *               file:
         *                 type: array
         *                 items:
         *                   type: string
         *                   format: binary
         *     responses:
         *       201:
         *         description: Post created successfully
         *       400:
         *         description: Bad request
         *       401:
         *         description: Unauthorized
         */
        this.router.post("/", upload.array("file"), this.postController.createPost);
        /**
         * @swagger
         * /api/posts/{id}:
         *   delete:
         *     summary: Delete a post
         *     tags: [Posts]
         *     parameters:
         *       - in: path
         *         name: id
         *         schema:
         *           type: string
         *         required: true
         *         description: Post ID
         *     responses:
         *       200:
         *         description: Post deleted successfully
         *       401:
         *         description: Unauthorized
         *       404:
         *         description: Post not found
         */
        this.router.delete("/:id", this.postController.deletePost);
        /**
         * @swagger
         * /api/posts/{id}:
         *   put:
         *     summary: Update a post
         *     tags: [Posts]
         *     parameters:
         *       - in: path
         *         name: id
         *         schema:
         *           type: string
         *         required: true
         *         description: Post ID
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               title:
         *                 type: string
         *               content:
         *                 type: string
         *               tags:
         *                 type: array
         *                 items:
         *                   type: string
         *     responses:
         *       200:
         *         description: Post updated successfully
         *       400:
         *         description: Bad request
         *       401:
         *         description: Unauthorized
         *       404:
         *         description: Post not found
         */
        this.router.put("/:id", this.postController.updatePost);
    }
}

export default new PostRoutes().router;
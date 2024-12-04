import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {createPost, deletePost, getPosts, updatePost} from "../controllers/post.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get( "/", getPosts);
router.post("/", upload.array("file"), createPost);
router.delete("/:id", deletePost);
router.put("/:id", updatePost);

export default router;
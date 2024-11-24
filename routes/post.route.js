import express from "express";
import {upload} from "../middlewares/multer.js";
import {createPost, deletePost, getPosts, downloadPost} from "../controllers/post.controller.js";

const router = express.Router();

router.get( "/", getPosts);

router.post("/", upload.single("file"), createPost);

router.get("/:id", downloadPost);

router.delete("/:id", deletePost);

export default router;
import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getUserById, getUserByNickname, getUserPostsById, getUserPostsByNickname } from "../controllers/user.controller";


const router = express.Router();

router.use(authenticate);

router.get("/:userId", getUserById);
router.get("/:nickname", getUserByNickname);
router.get("/:userId/posts", getUserPostsById);
router.get("/:nickname/posts", getUserPostsByNickname);

export default router;
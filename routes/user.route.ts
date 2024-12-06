import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getUserById, getUserByNickname, getUserPostsById, getUserPostsByNickname } from "../controllers/user.controller";

const router = express.Router();

router.use(authenticate);

router.get("/profile/id/:userId", getUserById);
router.get("/profile/nickname/:nickname", getUserByNickname);
router.get("/profile/id/:userId/posts", getUserPostsById);
router.get("/profile/nickname/:nickname/posts", getUserPostsByNickname);

export default router;

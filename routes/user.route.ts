import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getMe, getUserById, getUserByNickname, getUserPostsById, getUserPostsByNickname, updateMe } from "../controllers/user.controller";
import { uploadPicture } from "../middlewares/multer.middleware";

const router = express.Router();

router.use(authenticate);

router.get("/profile/id/:userId", getUserById);
router.get("/profile/nickname/:nickname", getUserByNickname);
router.get("/profile/id/:userId/posts", getUserPostsById);
router.get("/profile/nickname/:nickname/posts", getUserPostsByNickname);
router.put("/profile/settings", uploadPicture.single("file"), updateMe);
router.get("/profile", authenticate, getMe);

export default router;

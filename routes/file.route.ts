import express from "express"
import { authenticate } from "../middlewares/auth.middleware";
import { downloadFile, getFiles, postFile, deleteFile } from "../controllers/file.controller";
import { upload } from "../middlewares/multer.middleware";

const router = express.Router()

router.use(authenticate)

router.get("/:postId", getFiles);
router.post("/:postId", upload.array("file"), postFile);
router.get("/download/:id", downloadFile);
router.delete("/:postId/:id", deleteFile);

export default router;
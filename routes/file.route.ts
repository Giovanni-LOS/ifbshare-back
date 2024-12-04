import express from "express"
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router()

router.use(authenticate);

/* TODO:
router.post("/:postid", postFileToPost);
router.delete("/:id", deleteFileFromPost);
router.get("/:postid", getFilesFromPost);
router.get("/:id", downloadFile);
*/

export default router;
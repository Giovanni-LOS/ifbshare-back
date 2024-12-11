import express from "express"
import { deleteMe, getMe, login, logout, register, requestPassword, resetPassword, updateMe, verifyEmail } from "../controllers/auth.controller"
import { authenticate } from "../middlewares/auth.middleware"


const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/logout", authenticate, logout)
router.get("/me", authenticate, getMe)
router.put("/me", authenticate, updateMe)
router.delete("/me", authenticate, deleteMe)
router.post("/email/verify", verifyEmail)
router.post("/password/request", requestPassword)
router.post("/password/reset", resetPassword)

export default router
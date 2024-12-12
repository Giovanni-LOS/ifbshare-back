import express from "express"
import { deleteMe, login, logout, register, requestPassword, resetPassword, verifyEmail } from "../controllers/auth.controller"
import { authenticate } from "../middlewares/auth.middleware"


const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/logout", authenticate, logout)
router.delete("/me", authenticate, deleteMe)
router.post("/email/verify", verifyEmail)
router.post("/password/request", requestPassword)
router.post("/password/reset", resetPassword)

export default router
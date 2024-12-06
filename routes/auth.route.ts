import express from "express"
import { deleteMe, getMe, login, logout, register, updateMe } from "../controllers/auth.controller"
import { authenticate } from "../middlewares/auth.middleware"


const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/logout", authenticate, logout)
router.get("/me", authenticate, getMe)
router.put("/me", authenticate, updateMe)
router.delete("/me", authenticate, deleteMe)
//router.get("/email/verify/:email/:code", verifyEmail)
//router.post("/password/request", requestPassword)
//router.get("/password/check-request", checkRequestPassword)
//router.get("/password/verify/:email/:code", verifyRequestPassword)
//router.post("/password/reset", resetPassword)

export default router
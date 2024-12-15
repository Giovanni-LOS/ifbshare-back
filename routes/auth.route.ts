import express from "express"
import { deleteMe, login, logout, register, requestPassword, resetPassword, verifyEmail } from "../controllers/auth.controller"
import { authenticate } from "../middlewares/auth.middleware"


const router = express.Router()
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nickname
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               nickname:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", register)
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", login)
/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout a user
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: User logged out successfully
 *       400:
 *         description: Bad request
 */
router.get("/logout", authenticate, logout)
/**
 * @swagger
 * /api/auth/me:
 *   delete:
 *     summary: Delete the authenticated user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/me", authenticate, deleteMe)
/**
 * @swagger
 * /api/auth/email/verify:
 *   post:
 *     summary: Verify user email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: User verified successfully
 *       400:
 *         description: Invalid token
 *       404:
 *         description: Token expired or user not found
 */
router.post("/email/verify", verifyEmail)
/**
 * @swagger
 * /api/auth/password/request:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Password reset instructions sent
 *       400:
 *         description: Invalid email
 */
router.post("/password/request", requestPassword)
/**
 * @swagger
 * /api/auth/password/reset:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token or weak password
 *       404:
 *         description: Token expired or user not found
 */
router.post("/password/reset", resetPassword)

export default router
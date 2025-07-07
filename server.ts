import "express-async-errors";
import express from "express";
import { connectDB } from "./config/db"
import postRouter from "./routes/post.route";
import authRouter from "./routes/auth.route";
import fileRouter from "./routes/file.route";
import userRouter from "./routes/user.route";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware";
import setupSwagger from './config/swagger.ts';
import morgan from "morgan";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = ENV.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
setupSwagger(app);

const allowedOrigins = [
    "https://ifbshare-front.vercel.app", // Substitua pela URL real do seu frontend
    "http://localhost:3000" // Para ambiente local
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true, // Permite envio de cookies
}));

app.use(express.json());

app.use(express.urlencoded({ extended: false }))

app.use(cookieParser());

app.use(morgan("dev"));

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use("/api/auth", authRouter);

app.use("/api/posts", postRouter);

app.use("/api/files", fileRouter);

app.use("/api/users", userRouter);

// @ts-ignore
app.use(errorMiddleware);

app.listen(PORT, async () => {
    await connectDB();
    console.log("Server started at http://localhost:" + PORT);
});
import "express-async-errors";
import express from "express";
import { connectDB } from "./config/db"
import PostRoutes from "./routes/PostRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import FileRoutes from "./routes/FileRoutes";
import UserRoutes from "./routes/UserRoutes";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware";
import setupSwagger from './config/swagger.ts';
import morgan from "morgan";

const PORT = ENV.PORT;

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

app.use("/api/auth", AuthRoutes);

app.use("/api/posts", PostRoutes);

app.use("/api/files", FileRoutes);

app.use("/api/users", UserRoutes);

// @ts-expect-error: Express error handling middleware
app.use(errorMiddleware);

app.listen(PORT, async () => {
    await connectDB();
    console.log("Server started at http://localhost:" + PORT);
});
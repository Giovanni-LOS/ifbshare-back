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

const PORT = ENV.PORT;

const app = express();
setupSwagger(app);

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: false }))

app.use(cookieParser());

app.use(morgan("dev"));

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
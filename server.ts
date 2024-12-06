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
import { errorMidddleware } from "./middlewares/error.middleware";

const PORT = ENV.PORT;

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: false }))

app.use(cookieParser());

app.use("/api/auth", authRouter);

app.use("/api/posts", postRouter);

app.use("/api/files", fileRouter);

app.use("/api/users", userRouter);

// @ts-ignore
app.use(errorMidddleware);

app.listen(PORT, async () => {
    await connectDB();
    console.log("Server started at http://localhost:" + PORT);
});
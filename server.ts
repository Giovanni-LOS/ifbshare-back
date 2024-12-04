import "express-async-errors";
import express from "express";
import { connectDB } from "./config/db.js"
import postRouter from "./routes/post.route.js";
import authRouter from "./routes/auth.route.js"
import cors from "cors";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import { errorMidddleware } from "./middlewares/error.middleware.js";

const PORT = ENV.PORT;

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({extended: false}))

app.use(cookieParser());

app.use("/api/auth", authRouter);

app.use("/api/posts", postRouter);

// @ts-ignore
app.use(errorMidddleware);

app.listen(PORT, async () => {
    await connectDB();
    console.log("Server started at http://localhost:" + PORT);
});
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js"
import userRouter from "./routes/user.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5555;

app.use(express.json());

app.use("/api/users", userRouter);
// app.use("/api/posts", postRouter);

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js"
import userRouter from "./routes/user.route.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/users", userRouter);

app.listen(5555, () => {
    connectDB();
    console.log("Server started at http://localhost:5555");
});
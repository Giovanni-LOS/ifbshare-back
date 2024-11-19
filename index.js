import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js"
import User from "./model/user.model.js";

dotenv.config();

const app = express();

app.use(express.json());

app.post("/api/users", async (request,response) => {
     const user = request.body;

     if(!user.name || !user.email || !user.nickname || !user.password) {
         response.status(400).send("Email and password are required");
     }

     const newUser = new User(user);

     try {
         await newUser.save();
         response.status(201).send("User created successfully");
     } catch (error) {
         response.status(500).send(error.message);
     }
});

app.delete("/api/users/:id", async (request,response) => {
    const {id} = request.params;
    try {
        await User.findByIdAndDelete(id);
        response.status(200).send("User deleted successfully");
    } catch (error) {
        response.status(500).send(error.message);
    }
});
app.listen(5555, () => {
    connectDB();
    console.log("Server started at http://localhost:5555");
});
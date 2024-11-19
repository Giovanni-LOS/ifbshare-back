import User from "../model/user.model.js";
import mongoose from "mongoose";

export const getUsers = async (request,response) => {
    try {
        const users = await User.find();
        response.status(200).send(users);
    } catch (error) {
        response.status(500).send(error.message);
    }
}

export const createUser = async (request,response) => {
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
}

export const updateUser = async (request,response) => {
    const {id} = request.params;
    const {name, nickname, email, password} = request.body;

    if(!name || !email || !nickname || !password) {
        response.status(400).send("Name, email, nickname and password are required");
    }

    try {
        const user = await User.findById(id);

        if(user) {
            user.name = name;
            user.nickname = nickname;
            user.email = email;
            user.password = password;

            const updatedUser = await User.findByIdAndUpdate(id, user, {new:true});
            response.status(200).send(updatedUser);
        } else {
            response.status(404).send("User not found");
        }
    } catch (error) {
        response.status(500).send(error.message);
    }
}

export const partialUpdateUser = async (request,response) => {
    const {id} = request.params;
    const user = request.body;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        response.status(404).send("User not found");
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(id, user, {new: true});
        response.status(200).send(updatedUser);
    } catch (error) {
        response.status(500).send(error.message);
    }
}

export const deleteUser = async (request,response) => {
    const {id} = request.params;
    try {
        await User.findByIdAndDelete(id);
        response.status(200).send("User deleted successfully");
    } catch (error) {
        response.status(500).send(error.message);
    }
}

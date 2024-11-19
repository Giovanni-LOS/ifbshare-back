import express from "express";
import {createUser, deleteUser, getUsers, partialUpdateUser, updateUser} from "../controllers/user.controller.js";

const router = express.Router();

router.get( "/", getUsers);

router.post("/", createUser);

router.put("/:id", updateUser);

router.patch("/:id", partialUpdateUser);

router.delete("/:id", deleteUser);

export default router;
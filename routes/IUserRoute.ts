import { Router } from "express";
import { IUserController } from "../controllers/IUserController";

export interface IUserRoutes {
    router: Router;
    userController: IUserController;
    configureRoutes(): void;
}

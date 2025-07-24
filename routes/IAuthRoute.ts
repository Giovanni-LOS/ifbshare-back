import { Router } from "express";
import { IAuthController } from "../controllers/IAuthController";

export interface IAuthRoutes {
    router: Router;
    authController: IAuthController;
    configureRoutes(): void;
}

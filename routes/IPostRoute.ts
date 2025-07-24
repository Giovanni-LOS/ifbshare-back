import { Router } from "express";
import { IPostController } from "../controllers/IPostController";

export interface IPostRoutes {
    router: Router;
    postController: IPostController;
    configureRoutes(): void;
}

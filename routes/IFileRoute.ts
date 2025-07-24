import { Router } from "express";
import { IFileController } from "../controllers/IFileController";

export interface IFileRoutes {
    router: Router;
    fileController: IFileController;
    configureRoutes(): void;
}

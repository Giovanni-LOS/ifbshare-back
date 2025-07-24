import { RequestHandler } from "express";

export interface registerBody {
    name: string;
    nickname: string;
    email: string;
    password: string;
}

export interface loginBody {
    email: string;
    password: string;
}

export interface RequestPasswordBody {
    email: string;
}

export interface ResetPasswordBody {
    token: string;
    password: string;
    confirmPassword: string;
}

export interface verifyEmailBody {
    token: string;
}

export interface IAuthController {
    register: RequestHandler<Record<string, unknown>, Record<string, unknown>, registerBody>;
    login: RequestHandler<Record<string, unknown>, Record<string, unknown>, loginBody>;
    logout: RequestHandler;
    deleteMe: RequestHandler;
    requestPassword: RequestHandler<Record<string, unknown>, Record<string, unknown>, RequestPasswordBody>;
    resetPassword: RequestHandler<Record<string, unknown>, Record<string, unknown>, ResetPasswordBody>;
    verifyEmail: RequestHandler<Record<string, unknown>, Record<string, unknown>, verifyEmailBody>;
}

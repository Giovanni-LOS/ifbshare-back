import { RequestHandler } from "express";

interface registerBody {
    name: string;
    nickname: string;
    email: string;
    password: string;
}

interface loginBody {
    email: string;
    password: string;
}

interface RequestPasswordBody {
    email: string;
}

interface ResetPasswordBody {
    token: string;
    password: string;
    confirmPassword: string;
}

interface verifyEmailBody {
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

import { cleanEnv, str, port } from 'envalid';
import dotenv from "dotenv";

dotenv.config();

export const ENV = cleanEnv(process.env, {
    MONGO_URL: str({ desc: 'The MongoDB connection URL' }),
    JWT_SECRET: str({ desc: 'JWT secret key' }),
    PORT: port({ default: 5555, desc: 'Server port' }),
    IFB_DOMAIN: str({ desc: 'The IFB domain email' }),
    JWT_FORGOT_SECRET: str({ desc: 'JWT secret key for forgot password' }),
    RESEND_API_KEY: str({ desc: 'The API key for the email sending service' }),
    EMAIL_SENDER: str({ default: "onboarding@resend.dev", desc: 'The email sender' }),
    NODE_ENV: str({ desc: 'Project environment' })
});

import { resend } from "../config/resend";
import {ENV} from "../config/env";
import {HttpError} from "./httpError";

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        return await resend.emails.send({
            to,
            subject,
            html,
            from: ENV.EMAIL_SENDER
        });
    } catch (error) {
        throw new HttpError("Email not sent", 500);
    }
}
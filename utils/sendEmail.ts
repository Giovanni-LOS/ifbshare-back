import { resend } from "../config/resend";
import { ENV } from "../config/env";
import { HttpError } from "./httpError";

const getToEmail = (to: string) => ENV.NODE_ENV === "development" ? "delivered@resend.dev" : to;

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        return await resend.emails.send({
            to: getToEmail(to),
            subject,
            html,
            from: ENV.EMAIL_SENDER
        });
    } catch (error) {
        throw new HttpError("Email not sent", 500);
    }
}
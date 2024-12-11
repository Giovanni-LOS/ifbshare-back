import jwt from "jsonwebtoken"
import { ENV } from "../config/env"

export const generateJWT = (id: string | object | Buffer, expiresIn?: string | number | undefined ) => {
    return jwt.sign({ id }, ENV.JWT_SECRET, {
        expiresIn: expiresIn ?? '1d'
    })
}
import jwt from "jsonwebtoken"
import { ENV } from "../config/env"

export const generateJWT = (id: string | object | Buffer) => {
    return jwt.sign({ id }, ENV.JWT_SECRET, {
        expiresIn: '1d'
    })
}
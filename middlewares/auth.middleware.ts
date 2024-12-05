import jwt, { JwtPayload } from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import { HttpError } from "../utils/httpError";
import { ENV } from "../config/env";

const { TokenExpiredError } = jwt;

interface DecodedToken extends JwtPayload {
    id: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const { authToken } = req.cookies

    if (!authToken) {
        return next(new HttpError("Not authorized, no token provided", 401))
    }

    try {
        const decoded = jwt.verify(authToken, ENV.JWT_SECRET!) as DecodedToken

        req.userId = decoded.id
        
        next()
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return next(new HttpError("Token expired", 401));
        }

        next(new HttpError("Not authorized, invalid token", 403))
    }
}

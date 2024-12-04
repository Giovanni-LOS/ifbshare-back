export interface IHttpError extends Error {
    status: number;
}

export class HttpError extends Error {
    status: number 
    
    constructor (message: string, status: number) {
        super(message)
        this.status = status
        Error.captureStackTrace(this, this.constructor)
        Object.setPrototypeOf(this, HttpError.prototype)
    }
}
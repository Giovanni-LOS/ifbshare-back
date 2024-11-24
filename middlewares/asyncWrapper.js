import {response} from "express";
export const asyncWrapper = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            response.status(500).send({success: false, message: error.message});
        }
    };
};
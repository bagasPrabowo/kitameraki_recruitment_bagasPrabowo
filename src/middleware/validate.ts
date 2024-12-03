import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validate = (schema: Joi.ObjectSchema) =>
    (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            res.status(400).json({
                message: "Validation Error",
                details: error.details.map(detail => ({
                    message: detail.message,
                    path: detail.path,
                }))
            });
            return;
        }
        next();
    };
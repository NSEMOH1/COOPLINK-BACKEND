import { Request, Response, NextFunction, RequestHandler } from "express";
import Joi from "joi";

export const validateBody = <T>(schema: Joi.Schema<T>): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            allowUnknown: false,
            errors: {
                wrap: {
                    label: false,
                },
            },
        });

        if (error) {
            console.log("Detailed validation errors:", error.details);

            const errorMessages = error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message.replace(/"/g, ""),
            }));
            res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errorMessages,
            });
            return;
        }

        req.body = value;
        next();
    };
};

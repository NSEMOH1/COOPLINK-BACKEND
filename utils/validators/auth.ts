import Joi from "joi";

export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
});

export const loginSchema = Joi.object({
    service_number: Joi.string().required(),
    password: Joi.string().min(8).required(),
});

export const userLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

export const pinSchema = Joi.object({
    pin: Joi.string().min(4).max(4).required(),
});

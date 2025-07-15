import { Gender, MemberType, Rank, Relationship, Title } from "@prisma/client";
import Joi from "joi";

const guarantorSchema = Joi.object({
    first_name: Joi.string().required(),
    other_name: Joi.string().allow("").optional(),
    surname: Joi.string().required(),
    nationality: Joi.string().required(),
    address: Joi.string().required(),
    gender: Joi.string().valid(Gender.MALE, Gender.FEMALE).required(),
    phone: Joi.string().required(),
    email: Joi.string().email().allow("").optional(),
    rank: Joi.string()
        .valid(...Object.values(Rank))
        .required(),
    state_of_origin: Joi.string().required(),
    lga: Joi.string().required(),
    unit: Joi.string().required(),
    service_number: Joi.string().required(),
    date_of_birth: Joi.date().iso().required(),
    relationship: Joi.string()
        .valid(...Object.values(Relationship))
        .required(),
    title: Joi.string().valid(Title.MR, Title.MRS, Title.MISS).required(),
});

const bankSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    account_number: Joi.string().trim().min(1).required(),
});

const kycInfoSchema = Joi.object({
    identification: Joi.string().trim().min(1).required(),
    id_card: Joi.string().trim().min(1).required(),
    signature: Joi.string().trim().min(1).required(),
});

const nextOfKinSchema = Joi.object({
    first_name: Joi.string().trim().min(1).required(),
    last_name: Joi.string().trim().min(1).required(),
    nationality: Joi.string().trim().min(1).required(),
    relationship: Joi.string()
        .valid(...Object.values(Relationship))
        .required(),
    gender: Joi.string().valid(Gender.MALE, Gender.FEMALE).required(),
    phone: Joi.string().trim().min(1).required(),
    email: Joi.string().email().optional().allow(""),
    title: Joi.string()
        .valid(Title.MR, Title.MRS, Title.MISS)
        .required()
        .messages({
            "any.required": "Next of kin title is required",
            "any.only": `Title must be one of: ${Object.values(Title).join(
                ", "
            )}`,
        }),
});

const securitySchema = Joi.object({
    question: Joi.string().trim().min(1).required(),
    answer: Joi.string().trim().min(1).required(),
});

const baseMemberSchema = Joi.object({
    title: Joi.string().valid(Title.MR, Title.MRS, Title.MISS).required(),
    first_name: Joi.string().trim().min(1).required(),
    last_name: Joi.string().trim().min(1).required(),
    other_name: Joi.string().trim().allow("").default(""),
    gender: Joi.string().valid(Gender.MALE, Gender.FEMALE).required(),
    phone: Joi.string().trim().min(11).max(11).required(),
    email: Joi.string().email().required(),
    address: Joi.string().trim().min(1).required(),
    state_of_origin: Joi.string().trim().min(1).required(),
    lga: Joi.string().trim().min(1).required(),
    type: Joi.string()
        .valid(MemberType.CIVILIAN, MemberType.PERSONEL)
        .required(),
    service_number: Joi.string().allow("").default(""),
    bank: bankSchema.required(),
    kycInfo: kycInfoSchema.required(),
    security: securitySchema.required(),
    totalSavings: Joi.number().min(0).default(0),
    pin: Joi.string().required(),
    monthlyDeduction: Joi.number().min(0).default(0).required(),
    profile_picture: Joi.string().uri().allow("").default(""),
});

export const createMemberSchema = baseMemberSchema.when(".type", {
    switch: [
        {
            is: Joi.string().valid("PERSONEL").required(),
            then: Joi.object({
                service_number: Joi.string().required(),
                rank: Joi.string()
                    .valid(...Object.values(Rank))
                    .required(),
                unit: Joi.string().required(),
                nextOfKin: nextOfKinSchema.required(),
                guarantors: Joi.forbidden(),
            }),
        },
        {
            is: Joi.string().valid("CIVILIAN").required(),
            then: Joi.object({
                service_number: Joi.string().allow("").optional(),
                guarantors: Joi.array()
                    .items(guarantorSchema)
                    .min(1)
                    .required(),
                rank: Joi.forbidden(),
                unit: Joi.forbidden(),
                nextOfKin: Joi.forbidden(),
            }),
        },
    ],
});

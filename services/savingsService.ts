import { SavingStatus, SavingType, TransactionType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../config/database";
import { createSavings, IWithdrawSavings } from "../types";
import { generateSavingsReference } from "../utils/functions";
import { comparePin } from "../utils/password";

export const addSavings = async (data: createSavings) => {
    const validCategories = ["QUICK", "COOPERATIVE"] as const;

    if (!validCategories.includes(data.category_name as SavingType)) {
        throw new Error(
            `Invalid category. Must be one of: ${validCategories.join(", ")}`
        );
    }

    const category = await prisma.savingCategory.findUnique({
        where: { type: data.category_name as SavingType },
    });

    if (!category) {
        throw new Error("Savings Category doesn't exist");
    }

    const member = await prisma.member.findUnique({
        where: { id: data.memberId },
    });

    if (!member) {
        throw new Error("Member doesn't exist");
    }

    const amount =
        typeof data.amount === "object" && "toNumber" in data.amount
            ? data.amount.toNumber()
            : Number(data.amount);
    if (amount < 5000) {
        throw new Error("You cannot deposit less than ₦5000");
    }
    const result = await prisma.$transaction(async (tx) => {
        const saving = await tx.saving.create({
            data: {
                memberId: data.memberId,
                categoryId: category.id,
                amount: amount,
                reference: generateSavingsReference(),
                status: "COMPLETED",
            },
            include: {
                member: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        await tx.transaction.create({
            data: {
                memberId: data.memberId,
                amount: data.amount,
                type: TransactionType.SAVINGS_DEPOSIT,
                reference: saving.reference,
                description: `Savings deposit to ${category.name}`,
                status: "COMPLETED",
            },
        });

        await tx.member.update({
            where: { id: data.memberId },
            data: {
                totalSavings: {
                    increment: amount,
                },
            },
        });

        return saving;
    });

    return result;
};

export const withdrawSavings = async (data: IWithdrawSavings) => {
    const validCategories = ["QUICK", "COOPERATIVE"] as const;
    if (!validCategories.includes(data.category_name as SavingType)) {
        throw new Error(
            `Invalid category. Must be one of: ${validCategories.join(", ")}`
        );
    }

    const category = await prisma.savingCategory.findUnique({
        where: { type: data.category_name as SavingType },
    });

    if (!category) throw new Error("Savings Category doesn't exist");
    if (category.name === "COOPERATIVE")
        throw new Error("You cannot withdraw this yet");

    const member = await prisma.member.findUnique({
        where: { id: data.memberId },
        select: { id: true, pin: true, totalSavings: true },
    });

    if (!member) throw new Error("Member doesn't exist");

    const isPinValid = await comparePin(data.pin, member.pin);
    if (!isPinValid) throw new Error("Invalid PIN");

    const amount = new Decimal(data.amount);
    const zero = new Decimal(0);
    const memberTotalSavings = new Decimal(member.totalSavings);

    if (amount.lte(zero)) throw new Error("Amount must be greater than zero");
    if (memberTotalSavings.lt(amount))
        throw new Error("Insufficient savings balance");

    const result = await prisma.$transaction(async (tx) => {
        const saving = await tx.saving.create({
            data: {
                memberId: data.memberId,
                categoryId: category.id,
                amount: amount.negated(),
                reference: generateSavingsReference(),
                status: SavingStatus.COMPLETED,
            },
            include: {
                member: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
                category: { select: { id: true, name: true } },
            },
        });

        await tx.transaction.create({
            data: {
                memberId: data.memberId,
                amount: amount.toNumber(),
                type: TransactionType.SAVINGS_WITHDRAWAL,
                reference: saving.reference,
                description: `Savings withdrawal from ${category.name}`,
                status: SavingStatus.COMPLETED,
            },
        });

        await tx.member.update({
            where: { id: data.memberId },
            data: { totalSavings: { decrement: amount.toNumber() } },
        });

        return saving;
    });

    return result;
};

export const getSavingsBalance = async (memberId: string) => {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: {
            totalSavings: true,
            monthlyDeduction: true,
        },
    });

    if (!member) {
        throw new Error("Member doesn't exist");
    }

    const savingsByCategory = await prisma.saving.groupBy({
        by: ["categoryId"],
        where: {
            memberId: memberId,
        },
        _sum: {
            amount: true,
        },
    });

    const categories = await prisma.savingCategory.findMany({
        where: {
            id: {
                in: savingsByCategory.map((s) => s.categoryId),
            },
        },
        select: {
            id: true,
            name: true,
            type: true,
        },
    });

    const result = {
        totalSavings: member.totalSavings,
        monthlyDeduction: member.monthlyDeduction,
        normalSavings: new Decimal(0),
        cooperativeSavings: new Decimal(0),
        details: [] as Array<{
            categoryId: string;
            categoryName: string;
            amount: Decimal;
        }>,
    };

    savingsByCategory.forEach((saving) => {
        const category = categories.find((c) => c.id === saving.categoryId);
        if (category) {
            const amount = saving._sum.amount
                ? new Decimal(saving._sum.amount)
                : new Decimal(0);

            result.details.push({
                categoryId: category.id,
                categoryName: category.name,
                amount,
            });

            if (category.type === "QUICK") {
                result.normalSavings = result.normalSavings.add(amount);
            } else if (category.type === "COOPERATIVE") {
                result.cooperativeSavings =
                    result.cooperativeSavings.add(amount);
            }
        }
    });

    return result;
};

export const editDeduction = async (amount: number, memberId: string) => {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: {
            id: true,
            monthlyDeduction: true,
        },
    });

    if (!member) {
        throw new Error("Member not found");
    }

    const updatedMember = await prisma.member.update({
        where: { id: memberId },
        data: {
            monthlyDeduction: amount,
        },
        select: {
            id: true,
            monthlyDeduction: true,
        },
    });

    return {
        data: updatedMember,
        message: "Monthly deduction updated successfully",
    };
};

export const getAllSavings = () => {
    const savings = prisma.saving.findMany({
        select: {
            id: true,
            member: true,
            amount: true,
            category: true,
            reference: true,
            createdAt: true,
            status: true,
        },
    });

    if (!savings) {
        return "No Savings found";
    }

    return savings;
};

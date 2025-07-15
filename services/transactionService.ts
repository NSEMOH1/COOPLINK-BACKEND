import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";

interface GetTransactionsParams {
    memberId: string;
    startDate?: Date | string;
    endDate?: Date | string;
}

export const getTransactions = async ({
    memberId,
    startDate,
    endDate
}: GetTransactionsParams) => {
    const where: Prisma.TransactionWhereInput = {
        memberId: memberId
    };
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
            where.createdAt.lte = new Date(endDate);
        }
    }

    const transactions = await prisma.transaction.findMany({
        where,
        orderBy: {
            createdAt: 'desc' 
        }
    });

    return transactions || [];
};
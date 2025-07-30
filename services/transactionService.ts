import { prisma } from "../config/database";
import { Prisma, TransactionType } from "@prisma/client";

interface GetTransactionsParams {
    memberId: string;
    startDate?: Date | string;
    endDate?: Date | string;
}

export const getTransactions = async ({
    memberId,
    startDate,
    endDate,
}: GetTransactionsParams) => {
    const where: Prisma.TransactionWhereInput = {
        memberId: memberId,
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
            createdAt: "desc",
        },
    });

    return transactions || [];
};

interface GetPaymentsParams {
    startDate?: Date | string;
    endDate?: Date | string;
    memberId?: string;
    transactionType?: TransactionType;
    limit?: number;
    offset?: number;
}

export const getPayments = async ({
    startDate,
    endDate,
    memberId,
    transactionType,
    limit = 50,
    offset = 0,
}: GetPaymentsParams) => {
    const paymentTypes: TransactionType[] = [
        "LOAN_DISBURSEMENT",
        "SAVINGS_WITHDRAWAL",
    ];

    const where: Prisma.TransactionWhereInput = {
        type: transactionType
            ? { equals: transactionType }
            : { in: paymentTypes },
        status: "COMPLETED",
    };

    if (memberId) {
        where.memberId = memberId;
    }
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
            where.createdAt.lte = new Date(endDate);
        }
    }

    const payments = await prisma.transaction.findMany({
        where,
        include: {
            member: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    other_name: true,
                    email: true,
                    phone: true,
                    service_number: true,
                    type: true,
                },
            },
            loan: {
                select: {
                    id: true,
                    reference: true,
                    category: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
            savings: {
                select: {
                    id: true,
                    reference: true,
                    category: {
                        select: {
                            name: true,
                            type: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
        skip: offset,
    });

    const formattedPayments = payments.map((payment) => ({
        id: payment.id,
        memberName: `${payment.member?.first_name || ""} ${
            payment.member?.other_name || ""
        } ${payment.member?.last_name || ""}`.trim(),
        memberEmail: payment.member?.email,
        memberPhone: payment.member?.phone,
        serviceNumber: payment.member?.service_number,
        memberType: payment.member?.type,
        transactionType: payment.type,
        amount: payment.amount,
        description: payment.description,
        reference: payment.reference,
        date: payment.createdAt,
        status: payment.status,
        loanReference: payment.loan?.reference,
        loanCategory: payment.loan?.category?.name,
        savingsReference: payment.savings?.reference,
        savingsCategory: payment.savings?.category?.name,
        savingsType: payment.savings?.category?.type,
    }));

    const totalCount = await prisma.transaction.count({
        where,
    });

    return {
        payments: formattedPayments,
        pagination: {
            total: totalCount,
            limit,
            offset,
            hasMore: offset + payments.length < totalCount,
        },
    };
};
export const getPaymentsSummary = async ({
    startDate,
    endDate,
    memberId,
}: Omit<GetPaymentsParams, "limit" | "offset" | "transactionType">) => {
    const where: Prisma.TransactionWhereInput = {
        type: { in: ["LOAN_DISBURSEMENT", "SAVINGS_WITHDRAWAL"] },
        status: "COMPLETED",
    };

    if (memberId) {
        where.memberId = memberId;
    }

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
            where.createdAt.lte = new Date(endDate);
        }
    }

    const summary = await prisma.transaction.groupBy({
        by: ["type"],
        where,
        _sum: {
            amount: true,
        },
        _count: {
            id: true,
        },
    });

    return summary.map((item) => ({
        transactionType: item.type,
        totalAmount: item._sum.amount || 0,
        transactionCount: item._count.id,
    }));
};

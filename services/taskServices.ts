import { TaskType } from "@prisma/client";
import { prisma } from "../config/database";

export const createTask = async ({ tasks, assignedToId, createdById }: any) => {
    const taskArray = Array.isArray(tasks) ? tasks : [tasks];

    const creator = await prisma.user.findUnique({
        where: { id: createdById },
    });
    if (!creator || creator.role !== "SUPER_ADMIN") {
        throw new Error("Only SUPER_ADMIN can create tasks");
    }

    const assignee = await prisma.user.findUnique({
        where: { id: assignedToId },
    });
    if (!assignee || !["STAFF", "ADMIN"].includes(assignee.role)) {
        throw new Error("Tasks can only be assigned to STAFF or ADMIN");
    }

    const loanIds = taskArray
        .filter((task) => task.loanId)
        .map((task) => task.loanId);
    if (loanIds.length > 0) {
        const existingTasks = await prisma.task.findMany({
            where: {
                loanId: { in: loanIds },
                status: { not: "COMPLETED" },
            },
            select: {
                id: true,
                loanId: true,
                assignedToId: true,
                status: true,
            },
        });

        if (existingTasks.length > 0) {
            const assignedLoanIds = existingTasks.map((task) => task.loanId);
            const completedTasks = existingTasks.filter(
                (task) => task.status === "COMPLETED"
            );
            if (completedTasks.length > 0) {
                const completedLoanIds = completedTasks.map(
                    (task) => task.loanId
                );
                throw new Error(
                    `Loans with IDs ${completedLoanIds.join(
                        ", "
                    )} are already completed and cannot be reassigned`
                );
            }

            const sameAssigneeTasks = existingTasks.filter(
                (task) => task.assignedToId === assignedToId
            );
            if (sameAssigneeTasks.length > 0) {
                const sameAssigneeLoanIds = sameAssigneeTasks.map(
                    (task) => task.loanId
                );
                throw new Error(
                    `Loans with IDs ${sameAssigneeLoanIds.join(
                        ", "
                    )} are already assigned to this person`
                );
            }

            const tasksToDelete = existingTasks.filter(
                (task) => task.assignedToId !== assignedToId
            );
            if (tasksToDelete.length > 0) {
                await prisma.task.deleteMany({
                    where: {
                        id: { in: tasksToDelete.map((task) => task.id) },
                    },
                });
            }
        }

        const loans = await prisma.loan.findMany({
            where: { id: { in: loanIds } },
        });
        if (loans.length !== loanIds.length) {
            throw new Error("One or more loan IDs are invalid");
        }
    }

    const createdTasks = await prisma.$transaction(
        taskArray.map((task) =>
            prisma.task.create({
                data: {
                    type: task.type,
                    assignedToId,
                    createdById,
                    loanId: task.loanId || undefined,
                    description:
                        task.description ||
                        `Process task for ${task.loanId || task.memberId}`,
                    status: "PENDING",
                },
            })
        )
    );

    return createdTasks;
};

export const completeTask = async ({ taskIds, userId }: any) => {
    const taskIdArray = Array.isArray(taskIds) ? taskIds : [taskIds];

    const tasks = await prisma.task.findMany({
        where: { id: { in: taskIdArray } },
        include: { loan: true },
    });
    if (tasks.length !== taskIdArray.length) {
        throw new Error("One or more tasks not found");
    }

    for (const task of tasks) {
        if (task.assignedToId !== userId) {
            throw new Error("You are not authorized to complete this task");
        }
        if (task.status === "COMPLETED") {
            throw new Error("One or more tasks are already completed");
        }
    }

    const updatedTasks = await prisma.$transaction([
        ...tasks.map((task: any) =>
            prisma.task.update({
                where: { id: task.id },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                    transferredToDepartment: "ACCOUNT",
                },
            })
        ),
        ...tasks
            .filter((task: any) => task.loanId)
            .map((task: any) =>
                prisma.loan.update({
                    where: { id: task.loanId },
                    data: { transferredAt: new Date() },
                })
            ),
    ]);

    return updatedTasks.slice(0, tasks.length);
};

export const submitTaskReport = async ({
    type,
    date,
    userId,
    completedCount,
    uncompletedCount,
    memo,
}: any) => {
    if (
        !type ||
        !date ||
        !completedCount ||
        completedCount < 0 ||
        !uncompletedCount ||
        uncompletedCount < 0
    ) {
        throw new Error("Invalid report data");
    }

    const report = await prisma.taskReport.create({
        data: {
            type,
            completedCount: completedCount.toString(),
            uncompletedCount: uncompletedCount.toString(),
            user: userId,
            Memo: memo || "",
        },
    });

    return {
        userId,
        type,
        date,
        completedCount,
        uncompletedCount,
        memo,
        reportId: report.id,
    };
};

export const getUserTasks = async (userId: any) => {
    const tasks = await prisma.task.findMany({
        where: { assignedToId: userId, transferredToDepartment: null },
        include: {
            loan: {
                select: {
                    id: true,
                    amount: true,
                    status: true,
                    category: true,
                },
            },
            member: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    service_number: true,
                },
            },
            assignedTo: { select: { id: true, full_name: true } },
            createdBy: { select: { id: true, full_name: true } },
        },
    });

    return tasks;
};

export const getTransferredTasks = async (department: any) => {
    const tasks = await prisma.task.findMany({
        where: { transferredToDepartment: department },
        include: {
            loan: { select: { id: true, amount: true, status: true } },
            member: {
                select: { id: true, first_name: true, last_name: true },
            },
            assignedTo: { select: { id: true, full_name: true } },
        },
    });

    return tasks;
};

export const getDailyTaskStats = async ({ userId }: any) => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const stats = await prisma.task.groupBy({
        by: ["type"],
        where: {
            assignedToId: userId,
            completedAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
            status: "COMPLETED",
        },
        _count: { type: true },
    });

    const totalAssigned = await prisma.task.count({
        where: {
            assignedToId: userId,
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    const totalCompleted = await prisma.task.count({
        where: {
            assignedToId: userId,
            completedAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
            status: "COMPLETED",
        },
    });

    return {
        userId,
        date: startOfDay.toISOString(),
        totalAssigned,
        totalCompleted,
        breakdown: stats.map(({ type, _count }: any) => ({
            type,
            count: _count.type,
        })),
    };
};

export const assignLoanTask = async ({
    loanIds,
    assignedToId,
    createdById,
}: any) => {
    const loanIdArray = Array.isArray(loanIds) ? loanIds : [loanIds];

    const foundLoans = await prisma.loan.findMany({
        where: { id: { in: loanIdArray } },
    });
    if (foundLoans.length !== loanIdArray.length) {
        throw new Error("One or more loan IDs are invalid");
    }

    const tasks = loanIdArray.map((loanId) => ({
        type: TaskType.LOAN_APPLICATION,
        loanId,
        description: `Process loan application ${loanId}`,
    }));

    const createdTasks = await createTask({ tasks, assignedToId, createdById });

    return createdTasks;
};

export const getTransferredLoans = async (userId: any) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.department !== "ACCOUNT") {
        throw new Error("Only ACCOUNT department can view transferred loans");
    }

    const loans = await prisma.loan.findMany({
        where: { transferredAt: { not: null } },
        include: {
            member: { select: { id: true, first_name: true, last_name: true } },
            category: { select: { name: true } },
        },
    });

    return loans;
};

export const assignCashTask = async ({
    type,
    memberId,
    assignedToId,
    createdById,
    amount,
    description,
}: any) => {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
    });
    if (!member) {
        throw new Error("Member not found");
    }

    if (!["CASH_REFUND", "CASH_PAYMENT"].includes(type)) {
        throw new Error("Invalid cash task type");
    }

    const transaction = await prisma.transaction.create({
        data: {
            amount,
            type,
            description,
            status: "PENDING",
            memberId,
            reference: `CASH-${type}-${Date.now()}`,
        },
    });

    const task = await createTask({
        type,
        assignedToId,
        createdById,
        memberId,
        description: `${type} of ${amount} for member ${memberId}: ${description}`,
    });

    return { task, transaction };
};

export const getStaffTaskSummary = async (userId: any, date: any) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, full_name: true },
    });
    if (!user) {
        throw new Error("User not found");
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const assignedCount = await prisma.task.count({
        where: {
            assignedToId: userId,
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    const completedCount = await prisma.task.count({
        where: {
            assignedToId: userId,
            status: "COMPLETED",
            completedAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    return {
        userId: user.id,
        fullName: user.full_name,
        date: startOfDay.toISOString().split("T")[0],
        assignedCount,
        completedCount,
    };
};

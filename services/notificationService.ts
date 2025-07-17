import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { Server } from "http";
import { Decimal } from "@prisma/client/runtime/library";
import { config } from "../config/env";

const prisma = new PrismaClient();

interface NotificationData {
    title: string;
    message: string;
    type: "SUCCESS" | "INFO" | "WARNING" | "ERROR";
    actionType: string;
    actionId?: string;
    memberId?: string;
    userId?: string;
    metadata?: Record<string, any>;
}

const connectedMembers = new Map<string, string>();
const connectedUsers = new Map<string, string>();
let io: SocketIOServer;

const setupSocketHandlers = () => {
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("joinMember", async (memberId) => {
            socket.data.memberId = memberId;
            socket.data.userType = "member";
            connectedMembers.set(memberId, socket.id);

            const pendingNotifications = await prisma.notification.findMany({
                where: { memberId, status: "UNREAD" },
            });

            if (pendingNotifications.length > 0) {
                socket.emit("syncNotifications", pendingNotifications);
            }
        });

        socket.on("joinUser", (userId: string) => {
            socket.data.userId = userId;
            socket.data.userType = "user";
            connectedUsers.set(userId, socket.id);
            console.log(`User ${userId} joined`);
        });

        socket.on("disconnect", () => {
            if (socket.data.memberId) {
                connectedMembers.delete(socket.data.memberId);
                console.log(`Member ${socket.data.memberId} disconnected`);
            }
            if (socket.data.userId) {
                connectedUsers.delete(socket.data.userId);
                console.log(`User ${socket.data.userId} disconnected`);
            }
        });

        socket.on("reconnect", () => {
            if (socket.data.memberId) {
                connectedMembers.set(socket.data.memberId, socket.id);
            }
            if (socket.data.userId) {
                connectedUsers.set(socket.data.userId, socket.id);
            }
        });
    });
};

const initializeNotificationService = (server: Server) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: config.allowedOrigins,
            methods: ["GET", "POST"],
        },
    });

    setupSocketHandlers();
};

const createAndBroadcastNotification = async (data: NotificationData) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                title: data.title,
                message: data.message,
                type: data.type,
                actionType: data.actionType,
                actionId: data.actionId,
                metadata: data.metadata || {},
                memberId: data.memberId || null,
                userId: data.userId || null,
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
                User: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        department: true,
                    },
                },
            },
        });

        if (data.memberId) {
            const memberSocketId = connectedMembers.get(data.memberId);
            if (memberSocketId) {
                io.to(memberSocketId).emit("newNotification", notification);
            }
        }

        if (data.userId) {
            const userSocketId = connectedUsers.get(data.userId);
            if (userSocketId) {
                io.to(userSocketId).emit("newNotification", notification);
            }
        }

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

const notifyLoanApplication = async (
    memberId: string,
    loanId: string,
    amount: string,
    categoryName: string
) => {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: { first_name: true, last_name: true, service_number: true },
    });

    if (!member) throw new Error("Member not found");

    const eligibleUsers = await prisma.user.findMany({
        where: {
            role: { in: ["ADMIN", "SUPER_ADMIN", "STAFF"] },
            status: "ACTIVE",
        },
    });

    const notifications = [];
    for (const user of eligibleUsers) {
        const notification = await createAndBroadcastNotification({
            title: "New Loan Application",
            message: `${member.first_name} ${member.last_name} ${
                member.service_number ? `(${member.service_number})` : ""
            } has applied for a ${categoryName} loan of ₦${amount}`,
            type: "INFO",
            actionType: "LOAN_APPLICATION",
            actionId: loanId,
            userId: user.id,
            metadata: { memberId, loanId, amount, categoryName },
        });
        notifications.push(notification);
    }

    return notifications;
};

const notifyLoanStatus = async (
    memberId: string,
    loanId: string,
    status: string,
    userId: string,
    amount: Decimal,
    categoryName: string
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { full_name: true },
    });

    if (!user) throw new Error("User not found");

    let message: string;
    let type: "SUCCESS" | "INFO" | "WARNING" | "ERROR";

    if (status === "APPROVED") {
        message = `Your ${categoryName} loan application for ₦${amount.toString()} has been approved by ${
            user.full_name
        }`;
        type = "SUCCESS";
    } else if (status === "REJECTED") {
        message = `Your ${categoryName} loan application for ₦${amount.toString()} has been rejected by ${
            user.full_name
        }`;
        type = "ERROR";
    } else {
        message = `Your ${categoryName} loan application status has been updated to ${status}`;
        type = "INFO";
    }

    return await createAndBroadcastNotification({
        title: "Loan Status Update",
        message,
        type,
        actionType: "LOAN_STATUS_UPDATE",
        actionId: loanId,
        memberId,
        metadata: { loanId, status, userId, amount, categoryName },
    });
};

const notifySavingsDeposit = async (
    memberId: string,
    savingId: string,
    amount: string,
    categoryName: string
) => {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: { first_name: true, last_name: true, service_number: true },
    });

    if (!member) throw new Error("Member not found");

    const eligibleUsers = await prisma.user.findMany({
        where: {
            department: { in: ["ACCOUNT", "OPERATION"] },
            status: "ACTIVE",
        },
    });

    const notifications = [];
    for (const user of eligibleUsers) {
        const notification = await createAndBroadcastNotification({
            title: "New Savings Deposit",
            message: `${member.first_name} ${member.last_name} ${
                member.service_number ? `(${member.service_number})` : ""
            } has made a ${categoryName} savings deposit of ₦${amount}`,
            type: "INFO",
            actionType: "SAVINGS_DEPOSIT",
            actionId: savingId,
            userId: user.id,
            metadata: { memberId, savingId, amount, categoryName },
        });
        notifications.push(notification);
    }

    return notifications;
};

const notifyMemberRegistration = async (memberId: string) => {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: {
            first_name: true,
            last_name: true,
            email: true,
            type: true,
        },
    });

    if (!member) throw new Error("Member not found");

    const adminUsers = await prisma.user.findMany({
        where: {
            role: { in: ["ADMIN", "SUPER_ADMIN"] },
            status: "ACTIVE",
        },
    });

    const notifications = [];
    for (const user of adminUsers) {
        const notification = await createAndBroadcastNotification({
            title: "New Member Registration",
            message: `New ${member.type.toLowerCase()} member ${
                member.first_name
            } ${member.last_name} (${
                member.email
            }) has registered and is pending approval`,
            type: "INFO",
            actionType: "MEMBER_REGISTRATION",
            actionId: memberId,
            userId: user.id,
            metadata: { memberId, memberType: member.type },
        });
        notifications.push(notification);
    }

    return notifications;
};

const notifyMemberApproval = async (
    memberId: string,
    status: string,
    userId: string
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { full_name: true },
    });

    if (!user) throw new Error("User not found");

    let message: string;
    let type: "SUCCESS" | "INFO" | "WARNING" | "ERROR";

    if (status === "APPROVED") {
        message = `Congratulations! Your membership has been approved by ${user.full_name}. Welcome to the cooperative!`;
        type = "SUCCESS";
    } else if (status === "REJECTED") {
        message = `Your membership application has been rejected by ${user.full_name}. Please contact support for more information.`;
        type = "ERROR";
    } else {
        message = `Your membership status has been updated to ${status}`;
        type = "INFO";
    }

    return await createAndBroadcastNotification({
        title: "Membership Status Update",
        message,
        type,
        actionType: "MEMBER_APPROVAL",
        actionId: memberId,
        memberId,
        metadata: { status, userId },
    });
};

const notifyTransaction = async (
    memberId: string,
    transactionId: string,
    amount: string,
    type: string,
    description: string
) => {
    let message: string;
    let notificationType: "SUCCESS" | "INFO" | "WARNING" | "ERROR";

    switch (type) {
        case "LOAN_DISBURSEMENT":
            message = `Your loan of ₦${amount} has been disbursed to your account`;
            notificationType = "SUCCESS";
            break;
        case "LOAN_REPAYMENT":
            message = `Loan repayment of ₦${amount} has been processed`;
            notificationType = "INFO";
            break;
        case "SAVINGS_DEPOSIT":
            message = `Savings deposit of ₦${amount} has been confirmed`;
            notificationType = "SUCCESS";
            break;
        case "SAVINGS_WITHDRAWAL":
            message = `Savings withdrawal of ₦${amount} has been processed`;
            notificationType = "INFO";
            break;
        default:
            message = `Transaction: ${description} - ₦${amount}`;
            notificationType = "INFO";
    }

    return await createAndBroadcastNotification({
        title: "Transaction Update",
        message,
        type: notificationType,
        actionType: "TRANSACTION",
        actionId: transactionId,
        memberId,
        metadata: { transactionId, amount, type, description },
    });
};

const broadcastToMembers = async (
    title: string,
    message: string,
    type: "SUCCESS" | "INFO" | "WARNING" | "ERROR" = "INFO"
) => {
    const members = await prisma.member.findMany({
        where: { status: "APPROVED" },
        select: { id: true },
    });

    const notifications = [];
    for (const member of members) {
        const notification = await createAndBroadcastNotification({
            title,
            message,
            type,
            actionType: "BROADCAST",
            memberId: member.id,
            metadata: { broadcast: true },
        });
        notifications.push(notification);
    }

    return notifications;
};

const broadcastToUsers = async (
    title: string,
    message: string,
    type: "SUCCESS" | "INFO" | "WARNING" | "ERROR" = "INFO"
) => {
    const users = await prisma.user.findMany({
        where: { status: "ACTIVE" },
        select: { id: true },
    });

    const notifications = [];
    for (const user of users) {
        const notification = await createAndBroadcastNotification({
            title,
            message,
            type,
            actionType: "BROADCAST",
            userId: user.id,
            metadata: { broadcast: true },
        });
        notifications.push(notification);
    }

    return notifications;
};

const getIO = () => {
    return io;
};

export {
    initializeNotificationService,
    createAndBroadcastNotification,
    notifyLoanApplication,
    notifyLoanStatus,
    notifySavingsDeposit,
    notifyMemberRegistration,
    notifyMemberApproval,
    notifyTransaction,
    broadcastToMembers,
    broadcastToUsers,
    getIO,
};

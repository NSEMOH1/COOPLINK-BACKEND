import { PrismaClient } from "@prisma/client";
import { CreateNotificationData } from "../types";

const prisma = new PrismaClient();

export const createNotification = async (data: CreateNotificationData) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                memberId: data.memberId,
                title: data.title,
                message: data.message,
                type: data.type,
                actionType: data.actionType,
                actionId: data.actionId,
                metadata: data.metadata,
            },
        });

        // // Trigger real-time notification (WebSocket, SSE, etc.)
        // await sendRealTimeNotification(notification);

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

export const getMemberNotifications = async (
    memberId: string,
    options?: {
        limit?: number;
        offset?: number;
        status?: "UNREAD" | "READ" | "ARCHIVED";
    }
) => {
    const { limit = 20, offset = 0, status } = options || {};

    return await prisma.notification.findMany({
        where: {
            memberId,
            ...(status && { status }),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
    });
};

export const markNotificationAsRead = async (
    notificationId: string,
    memberId: string
) => {
    return await prisma.notification.update({
        where: {
            id: notificationId,
            memberId,
        },
        data: {
            status: "READ",
            updatedAt: new Date(),
        },
    });
};

export const markAllNotificationsAsRead = async (memberId: string) => {
    return await prisma.notification.updateMany({
        where: {
            memberId,
            status: "UNREAD",
        },
        data: {
            status: "READ",
            updatedAt: new Date(),
        },
    });
};

export const getUnreadNotificationCount = async (memberId: string) => {
    return await prisma.notification.count({
        where: {
            memberId,
            status: "UNREAD",
        },
    });
};

export const deleteNotification = async (
    notificationId: string,
    memberId: string
) => {
    return await prisma.notification.delete({
        where: {
            id: notificationId,
            memberId,
        },
    });
};

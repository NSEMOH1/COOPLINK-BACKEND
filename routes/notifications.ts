import express from "express";
import { PrismaClient, Role } from "@prisma/client";
import {
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
} from "../services/notificationService";
import { requireRoles } from "../middleware/requireRoles";

const prisma = new PrismaClient();
const router = express.Router();

router.get(
    "/member/:memberId",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req, res) => {
        try {
            const { memberId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const notifications = await prisma.notification.findMany({
                where: { memberId: memberId },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: "desc" },
            });
            res.json(notifications);
        } catch (error) {
            console.error("Error fetching member notifications:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.get(
    "/user/:userId",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req, res) => {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const notifications = await prisma.notification.findMany({
                where: { userId },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: "desc" },
                include: {
                    member: {
                        select: {
                            first_name: true,
                            last_name: true,
                            service_number: true,
                        },
                    },
                },
            });
            res.json(notifications);
        } catch (error) {
            console.error("Error fetching user notifications:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.put(
    "/:id/read",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const notification = await prisma.notification.update({
                where: { id },
                data: { status: "READ" },
            });
            res.json(notification);
        } catch (error) {
            console.error("Error marking notification as read:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.get(
    "/member/:memberId/unread-count",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req, res) => {
        try {
            const { memberId } = req.params;
            const count = await prisma.notification.count({
                where: {
                    memberId,
                    status: "UNREAD",
                },
            });
            res.json({ count });
        } catch (error) {
            console.error("Error fetching unread count:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.get(
    "/user/:userId/unread-count",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req, res) => {
        try {
            const { userId } = req.params;
            const count = await prisma.notification.count({
                where: {
                    userId,
                    status: "UNREAD",
                },
            });
            res.json({ count });
        } catch (error) {
            console.error("Error fetching unread count:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.post(
    "/loan-application",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req, res) => {
        try {
            const { memberId, loanId, amount, categoryName } = req.body;

            const notifications = await notifyLoanApplication(
                memberId,
                loanId,
                amount,
                categoryName
            );

            res.json({
                message: "Loan application notifications sent",
                notifications,
            });
        } catch (error) {
            console.error(
                "Error sending loan application notification:",
                error
            );
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.post(
    "/loan-status",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req, res) => {
        try {
            const { memberId, loanId, status, userId, amount, categoryName } =
                req.body;

            const notification = await notifyLoanStatus(
                memberId,
                loanId,
                status,
                userId,
                amount,
                categoryName
            );

            res.json(notification);
        } catch (error) {
            console.error("Error sending loan status notification:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.post(
    "/savings-deposit",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req, res) => {
        try {
            const { memberId, savingId, amount, categoryName } = req.body;

            const notifications = await notifySavingsDeposit(
                memberId,
                savingId,
                amount,
                categoryName
            );

            res.json({
                message: "Savings deposit notifications sent",
                notifications,
            });
        } catch (error) {
            console.error("Error sending savings deposit notification:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.post(
    "/member-registration",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req, res) => {
        try {
            const { memberId } = req.body;

            const notifications = await notifyMemberRegistration(memberId);

            res.json({
                message: "Member registration notifications sent",
                notifications,
            });
        } catch (error) {
            console.error(
                "Error sending member registration notification:",
                error
            );
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.post(
    "/member-approval",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req, res) => {
        try {
            const { memberId, status, userId } = req.body;

            const notification = await notifyMemberApproval(
                memberId,
                status,
                userId
            );

            res.json(notification);
        } catch (error) {
            console.error("Error sending member approval notification:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.post(
    "/transaction",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req, res) => {
        try {
            const { memberId, transactionId, amount, type, description } =
                req.body;

            const notification = await notifyTransaction(
                memberId,
                transactionId,
                amount,
                type,
                description
            );

            res.json(notification);
        } catch (error) {
            console.error("Error sending transaction notification:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.post(
    "/broadcast-members",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req, res) => {
        try {
            const { title, message, type = "INFO" } = req.body;

            const notifications = await broadcastToMembers(
                title,
                message,
                type as "SUCCESS" | "INFO" | "WARNING" | "ERROR"
            );

            res.json({
                message: "Broadcast sent to all members",
                count: notifications.length,
            });
        } catch (error) {
            console.error("Error broadcasting to members:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.post(
    "/broadcast-users",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req, res) => {
        try {
            const { title, message, type = "INFO" } = req.body;

            const notifications = await broadcastToUsers(
                title,
                message,
                type as "SUCCESS" | "INFO" | "WARNING" | "ERROR"
            );

            res.json({
                message: "Broadcast sent to all users",
                count: notifications.length,
            });
        } catch (error) {
            console.error("Error broadcasting to users:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

export { router as notificationRoutes };

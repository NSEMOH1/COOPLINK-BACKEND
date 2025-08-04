import { Router, Request, Response, NextFunction } from "express";
import { requireRoles } from "../middleware/requireRoles";
import { Role, TaskType } from "@prisma/client";
import { AuthenticatedRequest } from "../types";
import {
    assignCashTask,
    assignLoanTask,
    completeTask,
    getDailyTaskStats,
    getStaffTaskSummary,
    getTaskReports,
    getTransferredLoans,
    getUserTasks,
    submitTaskReport,
} from "../services/taskServices";

const router = Router();

router.post(
    "/assign-loan",
    requireRoles([Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { loanId, assignedToId } = req.body;
            const id = req.user?.id;
            const task = await assignLoanTask({
                loanIds: loanId,
                assignedToId,
                createdById: id,
            });
            res.status(201).json(task);
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/assign-cash",
    requireRoles([Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { type, memberId, assignedToId, amount, description } =
                req.body;
            const id = req.user;
            const result = await assignCashTask({
                type,
                memberId,
                assignedToId,
                createdById: id,
                amount,
                description,
            });
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/my-tasks",
    requireRoles([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.user?.id;
            const tasks = await getUserTasks(id);
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/daily-stats",
    requireRoles([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.user?.id;
            const tasks = await getDailyTaskStats(id);
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    "/complete",
    requireRoles([Role.STAFF, Role.ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { taskIds } = req.body;
            const id = req.user?.id;
            if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
                res.status(400).json({ error: "Task IDs are required" });
                return;
            }
            const updatedTasks = await completeTask({
                taskIds,
                userId: id,
            });
            res.json(updatedTasks);
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/submit-report",
    requireRoles([Role.STAFF, Role.ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const {
                date = new Date().toISOString().split("T")[0],
                completedCount,
                uncompletedCount = 0,
                memo = "",
                type = "",
            } = req.body;
            const userId = req.user?.id;

            if (
                !type ||
                !userId ||
                completedCount === undefined ||
                completedCount === null ||
                completedCount < 0 ||
                uncompletedCount < 0
            ) {
                throw new Error(
                    "Invalid report data: userId, completedCount, and uncompletedCount are required, and counts must be non-negative"
                );
            }

            const report = await submitTaskReport({
                type,
                date,
                userId,
                completedCount,
                uncompletedCount,
                memo,
            });
            res.status(201).json(report);
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/transferred-loans",
    requireRoles([Role.ADMIN, Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const id = req.user?.id;
        try {
            const loans = await getTransferredLoans(id);
            res.json(loans);
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/stats",
    requireRoles([Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { date = new Date().toISOString().split("T")[0] } = req.query;
            const stats = await getStaffTaskSummary({ date });
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/reports",
    requireRoles([Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const reports = await getTaskReports();
            res.json(reports);
        } catch (error) {
            next(error);
        }
    }
);

export { router as taskRoutes };

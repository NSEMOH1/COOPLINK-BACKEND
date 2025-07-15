import { Response, NextFunction, Router } from "express";
import {
    AuthenticatedRequest,
    createSavings,
    IWithdrawSavings,
} from "../types";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";
import {
    addSavings,
    editDeduction,
    getAllSavings,
    getSavingsBalance,
    withdrawSavings,
} from "../services/savingsService";

const router = Router();

router.post(
    "/deposit",
    requireRoles([Role.MEMBER]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const savingsData: createSavings = req.body;
            const memberId = req.user?.id;

            if (!memberId) {
                res.status(401).json({
                    error: "User not authenticated",
                });
                return;
            }
            const data = await addSavings({
                ...savingsData,
                memberId: memberId,
            });

            res.status(201).json({
                success: true,
                data: data,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/balances",
    requireRoles([Role.MEMBER]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const memberId = req.user?.id;
            if (!memberId) {
                res.status(401).json({
                    error: "User not authenticated",
                });
                return;
            }
            const balance = await getSavingsBalance(memberId);
            res.json({
                success: true,
                data: balance,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/withdraw",
    requireRoles([Role.MEMBER]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const savingsData: IWithdrawSavings = req.body;
            const memberId = req.user?.id;

            if (!memberId) {
                res.status(401).json({
                    error: "User not authenticated",
                });
                return;
            }
            const data = await withdrawSavings({
                ...savingsData,
                memberId: memberId,
            });

            res.status(201).json({
                success: true,
                data: data,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    "/deduction",
    requireRoles([Role.MEMBER]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { amount } = req.body;
            const memberId = req.user?.id;

            if (!memberId) {
                res.status(401).json({
                    error: "Member not authenticated",
                });
                return;
            }
            const data = await editDeduction(amount, memberId);

            res.status(201).json({
                success: true,
                data: data,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/",
    requireRoles([Role.ADMIN, Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await getAllSavings();

            res.status(201).json({
                success: true,
                savings: data,
            });
        } catch (error) {
            next(error);
        }
    }
);

export { router as savingsRoutes };

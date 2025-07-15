import { NextFunction, Request, Response, Router } from "express";
import { AuthenticatedRequest } from "../types";
import { getTransactions } from "../services/transactionService";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";

const router = Router();

router.get(
    "/",
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
                    success: false,
                    error: "User not authenticated",
                });
                return;
            }

            const { startDate, endDate } = req.query;

            const transactions = await getTransactions({
                memberId,
                startDate: startDate as string | undefined,
                endDate: endDate as string | undefined,
            });

            res.status(200).json({
                success: true,
                data: transactions,
                message:
                    transactions.length === 0
                        ? "No transactions found for the selected period"
                        : "Transactions retrieved successfully",
            });
        } catch (error) {
            next(error);
        }
    }
);

export { router as transactionRoutes };

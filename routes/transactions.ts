import { NextFunction, Request, Response, Router } from "express";
import { AuthenticatedRequest } from "../types";
import { getPayments, getPaymentsSummary, getTransactions } from "../services/transactionService";
import { requireRoles } from "../middleware/requireRoles";
import { Role, TransactionType } from "@prisma/client";

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

router.get(
    "/payments",
    requireRoles([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const {
                startDate,
                endDate,
                memberId,
                transactionType,
                limit,
                offset,
            } = req.query;

            if (
                transactionType &&
                !Object.values(TransactionType).includes(
                    transactionType as TransactionType
                )
            ) {
                res.status(400).json({
                    success: false,
                    error: "Invalid transaction type provided",
                });
                return;
            }

            const parsedLimit = limit ? parseInt(limit as string) : undefined;
            const parsedOffset = offset
                ? parseInt(offset as string)
                : undefined;

            if (
                (parsedLimit && parsedLimit <= 0) ||
                (parsedOffset && parsedOffset < 0)
            ) {
                res.status(400).json({
                    success: false,
                    error: "Invalid pagination parameters",
                });
                return;
            }

            const result = await getPayments({
                startDate: startDate as string | undefined,
                endDate: endDate as string | undefined,
                memberId: memberId as string | undefined,
                transactionType: transactionType as TransactionType | undefined,
                limit: parsedLimit,
                offset: parsedOffset,
            });

            res.status(200).json({
                success: true,
                data: result.payments,
                pagination: result.pagination,
                message:
                    result.payments.length === 0
                        ? "No payments found for the selected criteria"
                        : "Payments retrieved successfully",
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/summary",
    requireRoles([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { startDate, endDate, memberId } = req.query;

            const summary = await getPaymentsSummary({
                startDate: startDate as string | undefined,
                endDate: endDate as string | undefined,
                memberId: memberId as string | undefined,
            });

            res.status(200).json({
                success: true,
                data: summary,
                message: "Payment summary retrieved successfully",
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/member/:memberId",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { memberId } = req.params;
            const { startDate, endDate, limit, offset } = req.query;

            if (req.user?.role === Role.MEMBER && req.user.id !== memberId) {
                res.status(403).json({
                    success: false,
                    error: "Access denied. You can only view your own payments",
                });
                return;
            }

            const parsedLimit = limit ? parseInt(limit as string) : undefined;
            const parsedOffset = offset
                ? parseInt(offset as string)
                : undefined;

            const result = await getPayments({
                memberId,
                startDate: startDate as string | undefined,
                endDate: endDate as string | undefined,
                limit: parsedLimit,
                offset: parsedOffset,
            });

            res.status(200).json({
                success: true,
                data: result.payments,
                pagination: result.pagination,
                message:
                    result.payments.length === 0
                        ? "No payments found for this member"
                        : "Member payments retrieved successfully",
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/type/:transactionType",
    requireRoles([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { transactionType } = req.params;
            const { startDate, endDate, limit, offset } = req.query;

            if (
                !Object.values(TransactionType).includes(
                    transactionType as TransactionType
                )
            ) {
                res.status(400).json({
                    success: false,
                    error: "Invalid transaction type provided",
                });
                return;
            }

            const paymentTypes = ["LOAN_DISBURSEMENT", "SAVINGS_WITHDRAWAL"];
            if (!paymentTypes.includes(transactionType)) {
                res.status(400).json({
                    success: false,
                    error: "Transaction type must be a payment type (LOAN_DISBURSEMENT or SAVINGS_WITHDRAWAL)",
                });
                return;
            }

            const parsedLimit = limit ? parseInt(limit as string) : undefined;
            const parsedOffset = offset
                ? parseInt(offset as string)
                : undefined;

            const result = await getPayments({
                transactionType: transactionType as TransactionType,
                startDate: startDate as string | undefined,
                endDate: endDate as string | undefined,
                limit: parsedLimit,
                offset: parsedOffset,
            });

            res.status(200).json({
                success: true,
                data: result.payments,
                pagination: result.pagination,
                message:
                    result.payments.length === 0
                        ? `No ${transactionType
                              .toLowerCase()
                              .replace("_", " ")} payments found`
                        : `${transactionType
                              .toLowerCase()
                              .replace(
                                  "_",
                                  " "
                              )} payments retrieved successfully`,
            });
        } catch (error) {
            next(error);
        }
    }
);

export { router as transactionRoutes };

import { NextFunction, Router } from "express";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";
import { AuthenticatedRequest } from "../types";
import { Response } from "express";
import {
    generateBalanceSheetReport,
    generateFinancialReport,
    generateLoanRepaymentReport,
    generateMemberFinancialSummary,
    generateProfitLossReport,
    generateTrialBalanceReport,
    getAllMembersFinancialSummary,
} from "../services/reportService";

const router = Router();

router.post(
    "/financial-report",
    requireRoles([Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const {
                startDate,
                endDate,
                includeMemberDetails = false,
            } = req.body;
            const adminId = req.user?.id;
            if (!adminId) {
                res.status(401).json({
                    error: "User not authenticated",
                });
                return;
            }
            const report = await generateFinancialReport(
                new Date(startDate),
                new Date(endDate),
                includeMemberDetails
            );
            res.json({
                success: true,
                message: "Report Generated Successfully",
                ...report,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/repayment-report",
    requireRoles([Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const {
                startDate,
                endDate,
                includeMemberDetails = false,
            } = req.body;
            const adminId = req.user?.id;
            if (!adminId) {
                res.status(401).json({
                    error: "User not authenticated",
                });
                return;
            }
            const report = await generateLoanRepaymentReport(
                new Date(startDate),
                new Date(endDate),
                includeMemberDetails
            );
            res.json({
                success: true,
                message: "Report Generated Successfully",
                ...report,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/member-financial-summary/:memberId",
    requireRoles([Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { memberId } = req.params;
            const { startDate, endDate } = req.body;
            const adminId = req.user?.id;
            if (!adminId) {
                res.status(401).json({
                    error: "User not authenticated",
                });
                return;
            }
            const request = await generateMemberFinancialSummary(
                memberId,
                startDate,
                endDate
            );
            res.json({
                success: true,
                message: "Report Generated Successfully",
                ...request,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/financial-summary",
    requireRoles([Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { startDate, endDate } = req.body;
            const adminId = req.user?.id;
            if (!adminId) {
                res.status(401).json({
                    error: "User not authenticated",
                });
                return;
            }
            const request = await getAllMembersFinancialSummary(
                startDate,
                endDate
            );
            res.json({
                success: true,
                message: "Report Generated Successfully",
                ...request,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/trial-balance",
    requireRoles([Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { asOfDate } = req.body;
            const adminId = req.user?.id;
            if (!adminId) {
                res.status(401).json({
                    error: "User not authenticated",
                });
                return;
            }
            const request = await generateTrialBalanceReport(asOfDate);
            res.json({
                success: true,
                message: "Report Generated Successfully",
                ...request,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/profit-loss",
    requireRoles([Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { startDate, endDate } = req.body;
            const adminId = req.user?.id;
            if (!adminId) {
                res.status(401).json({
                    error: "User not authenticated",
                });
                return;
            }
            const request = await generateProfitLossReport(startDate, endDate);
            res.json({
                success: true,
                message: "Report Generated Successfully",
                ...request,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/balance-sheet",
    requireRoles([Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { asOfDate } = req.body;
            const adminId = req.user?.id;
            if (!adminId) {
                res.status(401).json({
                    error: "User not authenticated",
                });
                return;
            }
            const request = await generateBalanceSheetReport(asOfDate);
            res.json({
                success: true,
                message: "Report Generated Successfully",
                ...request,
            });
        } catch (error) {
            next(error);
        }
    }
);

export { router as reportsRoutes };

import { Router, Request, Response, NextFunction } from "express";
import {
    approveMember,
    changePin,
    deleteMember,
    deleteUser,
    findMemberById,
    getAllMembers,
    getAllUsers,
    rejectMember,
    updateMember,
    updateUser,
} from "../services/userService";
import { AuthenticatedRequest, UpdateUserData } from "../types";
import { requireRoles } from "../middleware/requireRoles";
import { MemberStatus, Role, UserStatus } from "@prisma/client";
import { generateMemberPassword } from "../services/authService";
import { validateBody } from "../middleware/validateBody";
import { pinSchema } from "../utils/validators/auth";
import { notifyMemberApproval } from "../services/notificationService";

const router = Router();

router.delete(
    "/member/:id",
    requireRoles([Role.ADMIN, Role.SUPER_ADMIN]),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({ message: "Member ID is required" });
                return;
            }

            const deletedUser = await deleteMember(id);
            res.status(200).json({
                message: "User deleted successfully",
                id: deletedUser.id,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    "/member/:id",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const memberData: UpdateUserData = req.body;

            if (!id) {
                res.status(400).json({ message: "Member ID is required" });
                return;
            }

            if (Object.keys(memberData).length === 0) {
                res.status(400).json({ message: "No update data provided" });
                return;
            }
            const updatedMember = await updateMember(id, memberData);

            res.status(200).json({
                message: "Member updated successfully",
                user: updatedMember,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/members",
    requireRoles([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const {
                page = "1",
                limit = "10",
                search = "",
                sortBy = "created_at",
                sortOrder = "desc",
                role,
                status,
                createdAfter,
                createdBefore,
            } = req.query;

            const result = await getAllMembers({
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                search: search as string,
                sortBy: sortBy as
                    | "created_at"
                    | "email"
                    | "first_name"
                    | "last_name",
                sortOrder: sortOrder as "asc" | "desc",
                role: role as string,
                status: status as MemberStatus,
                createdAfter: createdAfter
                    ? new Date(createdAfter as string)
                    : undefined,
                createdBefore: createdBefore
                    ? new Date(createdBefore as string)
                    : undefined,
            });

            res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/members/:id",
    requireRoles([Role.MEMBER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const user = await findMemberById(id);
            res.status(200).json({
                success: true,
                user: user,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    "/users/:id",
    requireRoles([Role.ADMIN, Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userData: UpdateUserData = req.body;
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            const updatedUser = await updateUser(id, userData);

            res.json({
                success: true,
                message: "User updated successfully",
                data: updatedUser,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.delete(
    "/users/:id",
    requireRoles([Role.ADMIN, Role.SUPER_ADMIN]),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({ message: "User ID is required" });
                return;
            }

            const deletedUser = await deleteUser(id);
            res.status(200).json({
                message: "User deleted successfully",
                id: deletedUser.id,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/members/:memberId/approve",
    requireRoles([Role.ADMIN, Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { memberId } = req.params;
            const adminId = req.user?.id;

            if (!memberId) {
                res.status(400).json({ message: "Member ID is required" });
                return;
            }

            if (!adminId) {
                res.status(401).json({
                    error: "User not authenticated",
                });
                return;
            }

            const approvedMember = await approveMember({ memberId });
            await notifyMemberApproval(
                memberId,
                approvedMember.status,
                adminId
            );
            res.status(200).json({
                message: "Member approved successfully",
                id: approvedMember.id,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/members/:memberId/reject",
    requireRoles([Role.ADMIN, Role.SUPER_ADMIN]),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { memberId } = req.params;

            if (!memberId) {
                res.status(400).json({ message: "Member ID is required" });
                return;
            }

            const rejectedMember = await rejectMember({ memberId });
            res.status(200).json({
                message: "Member rejected successfully",
                id: rejectedMember.id,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/member/:memberId/generate-password",
    requireRoles([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { memberId } = req.params;
            const adminId = req.user?.id;

            if (!adminId) {
                res.status(401).json({
                    success: false,
                    message: "Admin authentication required",
                });
                return;
            }

            const result = await generateMemberPassword({
                memberId,
            });

            res.json({
                success: true,
                message: "Password generated successfully",
                data: {
                    temporaryPassword: result.temporaryPassword,
                    user: result.user,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/member/change-pin",
    validateBody(pinSchema),
    requireRoles([Role.MEMBER]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const memberId = req.user?.id;
            const { pin } = req.body;

            if (!memberId) {
                res.status(400).json({ message: "Member ID is required" });
                return;
            }

            const result = await changePin(pin, memberId);

            res.json({
                success: true,
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/users",
    requireRoles([Role.ADMIN, Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const {
                page = "1",
                limit = "10",
                search = "",
                sortBy = "created_at",
                sortOrder = "desc",
                role,
                status,
                createdAfter,
                createdBefore,
            } = req.query;

            const result = await getAllUsers({
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                search: search as string,
                sortBy: sortBy as "created_at" | "email",
                sortOrder: sortOrder as "asc" | "desc",
                role: role as string,
                status: status as UserStatus,
                createdAfter: createdAfter
                    ? new Date(createdAfter as string)
                    : undefined,
                createdBefore: createdBefore
                    ? new Date(createdBefore as string)
                    : undefined,
            });

            res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }
);

export { router as userRoutes };

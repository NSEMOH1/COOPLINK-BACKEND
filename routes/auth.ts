import { Router, Response, Request, NextFunction } from "express";
import {
    AuthenticatedRequest,
    CreateMemberData,
    CreateUserData,
    LoginData,
    UserLoginData,
} from "../types";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";
import {
    changePassword,
    authenticateUser,
    authenticateMember,
} from "../services/authService";
import { createMember, createUser } from "../services/userService";
import { createMemberSchema } from "../utils/validators/member";
import { validateBody } from "../middleware/validateBody";
import {
    changePasswordSchema,
    loginSchema,
    userLoginSchema,
} from "../utils/validators/auth";

const router = Router();

router.post(
    "/user/register",
    // requireRoles([Role.SUPER_ADMIN]),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userData: CreateUserData = req.body;

            if (!userData) {
                res.status(401).json({
                    success: false,
                    message: "Please make sure all parameters are sent",
                });

                return;
            }
            await createUser(userData);

            res.json({
                success: true,
                message: "User Created Successfully",
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/change-password",
    requireRoles([Role.STAFF, Role.MEMBER]),
    validateBody(changePasswordSchema),
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { oldPassword, newPassword } = req.body;
            const memberId = req.user?.id;

            if (!memberId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });

                return;
            }

            if (newPassword.length < 8) {
                res.status(400).json({
                    success: false,
                    message: "New password must be at least 8 characters long",
                });
                return;
            }

            await changePassword({
                memberId,
                oldPassword,
                newPassword,
            });

            res.json({
                success: true,
                message: "Password changed successfully",
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/member/register",
    validateBody(createMemberSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData = req.body as CreateMemberData;

            const member = await createMember(userData);

            res.status(201).json({
                success: true,
                message:
                    "Member created successfully. Admin must generate password to activate account.",
                data: {
                    id: member.id,
                    email: member.email,
                    name: `${member.first_name} ${member.last_name}`,
                    role: member.role,
                    hasPassword: false,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/member/login",
    validateBody(loginSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const loginData: LoginData = req.body;

            const result = await authenticateMember(loginData);

            res.json({
                success: true,
                message: "Login successful",
                ...result,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("Account not activated")) {
                    res.status(403).json({
                        success: false,
                        message:
                            "Account not activated. Please contact administrator.",
                        code: "ACCOUNT_NOT_ACTIVATED",
                    });
                    return;
                } else if (error.message === "Invalid credentials") {
                    res.status(401).json({
                        success: false,
                        message: "Invalid email or password",
                    });
                    return;
                }
            }
            next(error);
        }
    }
);

router.post(
    "/user/login",
    validateBody(userLoginSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const loginData: UserLoginData = req.body;

            const result = await authenticateUser(loginData);

            res.json({
                success: true,
                message: "Login successful",
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }
);

export { router as authRoutes };

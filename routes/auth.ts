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
import { notifyMemberRegistration } from "../services/notificationService";
import { handleFileUpload } from "../middleware/fileUpload";
import path from "path";
import fs from "fs";

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

router.get("/uploads/:filename", (req, res) => {
    const filePath = path.join(__dirname, "../uploads", req.params.filename);

    if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath);
        let contentType = "application/octet-stream";

        if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        else if (ext === ".png") contentType = "image/png";
        else if (ext === ".pdf") contentType = "application/pdf";

        res.setHeader("Content-Type", contentType);
        res.sendFile(filePath);
    } else {
        res.status(404).json({ success: false, message: "File not found" });
    }
});

router.post(
    "/member/register",
    validateBody(createMemberSchema),
    handleFileUpload,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData: CreateMemberData = JSON.parse(req.body.data);
            
            const files = req.files as {
                profile_picture?: Express.Multer.File[];
                identification?: Express.Multer.File[];
                id_card?: Express.Multer.File[];
                signature?: Express.Multer.File[];
            };

            const transformedData = {
                ...userData,
                profile_picture: files.profile_picture?.[0]?.filename,
                kycInfo: {
                    identification: files.identification?.[0]?.filename,
                    id_card: files.id_card?.[0]?.filename,
                    signature: files.signature?.[0]?.filename,
                },
            };

            const member = await createMember(transformedData);
            await notifyMemberRegistration(member.id);
            res.status(201).json({
                success: true,
                message: "Member created successfully.",
                data: {
                    id: member.id,
                    email: member.email,
                    name: `${member.first_name} ${member.last_name}`,
                    role: member.role,
                    hasPassword: false,
                },
            });
        } catch (error) {
            if (req.files) {
                const files = req.files as Record<
                    string,
                    Express.Multer.File[]
                >;
                Object.values(files).forEach((fileArray) => {
                    fileArray.forEach((file) => {
                        require("fs").unlink(
                            path.join(__dirname, "../uploads", file.filename),
                            () => {}
                        );
                    });
                });
            }
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
// router.post(
//     "/forgot-password",
//     async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//         try {
//             const result = await sendPasswordResetOtp(req.body.email);
//             res.json({ ...result, message: "OTP sent to email" });
//         } catch (error) {
//             next(error);
//         }
//     }
// );

// router.post(
//     "/verify-otp",
//     async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//         try {
//             await verifyResetOtp(req.body.email, req.body.otp);
//             res.json({ success: true, message: "OTP verified" });
//         } catch (error) {
//             next(error);
//         }
//     }
// );

// router.post(
//     "/reset-password",
//     async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//         try {
//             await updatePassword(req.body.email, req.body.newPassword);
//             res.json({ success: true, message: "Password updated" });
//         } catch (error) {
//             next(error);
//         }
//     }
// );

export { router as authRoutes };



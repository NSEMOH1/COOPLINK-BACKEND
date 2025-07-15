import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verifyToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../types";

export const requireRoles = (allowedRoles: Role[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];

            if (!token) {
                res.status(401).json({ message: "No token provided" });
                return;
            }

            const decoded = verifyToken(token) as any;

            if (!allowedRoles.includes(decoded.role)) {
                res.status(403).json({
                    message: "Insufficient permissions",
                });
                return;
            }
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: "Invalid token" });
        }
    };
};

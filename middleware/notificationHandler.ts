import { Response, NextFunction } from "express";
import { AuthenticatedRequest, CreateNotificationData } from "../types";
import { createNotification } from "../services/notificationService";

export const createNotificationMiddleware = (
    getNotificationData: (
        req: AuthenticatedRequest,
        result?: any
    ) => CreateNotificationData | null
) => {
    return async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        const originalJson = res.json;
        res.json = function (body: any) {
            const result = originalJson.call(this, body);

            if (res.statusCode >= 200 && res.statusCode < 300) {
                const notificationData = getNotificationData(req, body);
                if (notificationData) {
                    createNotification(notificationData).catch(console.error);
                }
            }
            return result;
        };

        next();
    };
};

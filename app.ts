import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler";
import { config } from "./config/env";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/user";
import { loanRoutes } from "./routes/loan";
import { savingsRoutes } from "./routes/savings";
import { transactionRoutes } from "./routes/transactions";

const createApp = () => {
    const app = express();
    app.use(helmet());
    app.use(
        cors({
            origin: config.allowedOrigins,
            credentials: true,
        })
    );
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 500, // Limit each IP to 500 requests per windowMs
    });
    app.use(limiter);

    if (config.nodeEnv !== "test") {
        app.use(morgan("combined"));
    }
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get("/health", (req, res) => {
        res.json({ status: "OK", timestamp: new Date().toISOString() });
    });

    app.use("/api/auth", authRoutes);
    app.use("/api", userRoutes);
    app.use("/api/loan", loanRoutes);
    app.use("/api/savings", savingsRoutes);
    app.use("/api/transactions", transactionRoutes);

    app.use(/.*/, (req, res) => {
        res.status(404).json({ error: "Route not found" });
    });
    app.use(errorHandler);
    return app;
};

export { createApp };

// server.ts
import { createApp } from "./app";
import { config } from "./config/env";

const startServer = async () => {
    try {
        const { app, server } = createApp();

        server.listen(config.port, () => {
            console.log(`🚀 Server running on port ${config.port}`);
            console.log(`📖 Environment: ${config.nodeEnv}`);
        });

        process.on("SIGTERM", () => {
            console.log("SIGTERM received, shutting down gracefully");
            server.close(() => {
                console.log("Process terminated");
            });
        });

        process.on("SIGINT", () => {
            console.log("\n🛑 Shutting down server...");
            server.close(() => {
                console.log("Process terminated");
            });
        });

        return { app, server };
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

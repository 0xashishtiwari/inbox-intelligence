import express from "express";
import cors from "cors";
import "dotenv/config";
import authRouter from "./routes/auth.routes.js";
import { checkDatabaseConnection } from "@repo/db";
import meRoutes from "./routes/me.routes.js";
import cookieParser from "cookie-parser";
import {httpLogger} from "./middleware/logger.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { logger } from "./config/logger.js";
import gmailRouter from "./routes/gmail.routes.js";
import searchRouter from "./routes/search.routes.js";

const app = express(); 

app.use(express.json());
app.use(cookieParser());
app.use(httpLogger);


app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));



app.get('/health', async (req, res) => {
    try {
        await checkDatabaseConnection();
        res.status(200).json({ status: "ok", database: "connected" });
    } catch (error) {
        req.log.error({ err: error }, "Database connection error");
        res.status(503).json({ status: "error", database: "disconnected" });
    }
});

app.use("/api", meRoutes);
app.use("/api", gmailRouter);
app.use("/api", searchRouter);

app.use("/auth", authRouter);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Route not found
app.use((_, res) => {
    res.status(404).json({ error: "Route not found" });
});



app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Health check endpoint: http://localhost:${PORT}/health`);
});
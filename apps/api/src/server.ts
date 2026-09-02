import express from "express";
import cors from "cors";
import "dotenv/config";
import authRouter from "./routes/auth.routes.js";
import { checkDatabaseConnection } from "@repo/db";


const app = express();

app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        await checkDatabaseConnection();
        res.status(200).json({ status: "ok", database: "connected" });
    } catch (error) {
        console.error("Database health check failed:", error);
        res.status(503).json({ status: "error", database: "disconnected" });
    }
});

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use("/auth", authRouter);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check endpoint: http://localhost:${PORT}/health`);
});
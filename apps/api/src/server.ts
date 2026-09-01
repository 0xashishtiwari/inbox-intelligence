import express from "express";
import cors from "cors";
import "dotenv/config";
import authRouter from "./routes/auth.routes.js";


const app = express();

app.use(express.json());


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
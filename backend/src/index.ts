import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";
import healthRoutes from "./routes/health";

dotenv.config();

const app = express();

// Security & Performance Middleware
app.use(helmet());
app.use(compression());

// Body Parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb", extended: true }));

// Logging
app.use(requestLogger);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/health", healthRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error Handler (must be last)
app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);
const NODE_ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT} [${NODE_ENV}]`);
});

export default app;

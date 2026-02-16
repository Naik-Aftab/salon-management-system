import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";
import branchRoutes from "./routes/branches";
import designationRoutes from "./routes/designations";
import skillRoutes from "./routes/skills";
import employeeRoutes from "./routes/employees";
import shiftRoutes from "./routes/shifts";
import shiftAssignmentRoutes from "./routes/shiftAssignments";
import leaveRoutes from "./routes/leaves";
import customerRoutes from "./routes/customers";
import appointmentRoutes from "./routes/appointments";

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
app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/shift-assignments", shiftAssignmentRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/appointments", appointmentRoutes);

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

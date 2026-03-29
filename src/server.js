import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { config } from "dotenv";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB, disconnectDB } from "./config/db.js";
import { swaggerSpec } from "./docs/swagger.js";
import authRoutes from "./routes/authRoutes.js";
import choreRoutes from "./routes/choreRoutes.js";
import cleaningEventRoutes from "./routes/cleaningEventRoutes.js";
import householdRoutes from "./routes/householdRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import taskAssignmentRoutes from "./routes/taskAssignmentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
 
config();
connectDB();

const app = express();
const server = createServer(app);

const PORT = Number(process.env.PORT) || 5050;
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

function setupRealtime(serverInstance) {
  const io = new Server(serverInstance, { cors: corsOptions });
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

function setupMiddleware() {
  if (IS_DEVELOPMENT) {
    app.use(cors(corsOptions));
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
}

function setupRoutes() {
  app.use("/auth", authRoutes);
  app.use("/chores", choreRoutes);
  app.use("/rooms", roomRoutes);
  app.use("/households", householdRoutes);
  app.use("/cleaning-events", cleaningEventRoutes);
  app.use("/task-assignments", taskAssignmentRoutes);
  app.use("/users", userRoutes);

  if (IS_DEVELOPMENT) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
}

function shutdown(exitCode) {
  server.close(async () => {
    await disconnectDB();
    process.exit(exitCode);
  });
}

function setupProcessHandlers() {
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    shutdown(1);
  });

  process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);
    await disconnectDB();
    process.exit(1);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    shutdown(0);
  });
}

setupRealtime(server);
setupMiddleware();
setupRoutes();
setupProcessHandlers();

server.listen(PORT, () => {
  console.log(`server is listening on PORT ${PORT}`);
});

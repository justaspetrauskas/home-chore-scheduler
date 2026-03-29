import express from 'express'
import { createServer } from "node:http";
import { Server } from "socket.io";
import { config } from "dotenv"
import swaggerUi from "swagger-ui-express";
import { connectDB, disconnectDB } from './config/db.js'
import {swaggerSpec} from "./docs/swagger.js"
import choreRoutes from "./routes/choreRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import cleaningEventRoutes from "./routes/cleaningEventRoutes.js"
import cors from "cors";
import cookieParser from "cookie-parser"
import roomRoutes from "./routes/roomRoutes.js"
import householdRoutes from "./routes/householdRoutes.js"
import userRoutes from "./routes/userRoutes.js" 



config();
connectDB();


const app = express()
const server = createServer(app);

// CORS middleware
const corsOptions = {
  origin: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
};

if (process.env.NODE_ENV === "development") {
  app.use(cors(corsOptions));
}

const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Body parsing and cookie parsing middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

// API Routes
app.use("/auth", authRoutes)
app.use("/chores", choreRoutes)
app.use("/rooms", roomRoutes)
app.use("/households", householdRoutes)
app.use("/cleaning-events", cleaningEventRoutes)
app.use("/users", userRoutes)



// Swagger
if (process.env.NODE_ENV === "development") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}


const PORT = 5050;

server.listen(PORT,()=>{
    console.log(`server is listening on PORT ${PORT}`)
})

// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});

// AUTH
// CHORE
// AREA
// USER
// ASIGNMENT

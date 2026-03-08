import express from 'express'
import { config } from "dotenv"
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { connectDB, disconnectDB } from './config/db.js'

// Start cron jobs
import '../src/cronTest.js'

import choreRoutes from "./routes/choreRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import roomRoutes from "./routes/roomRoutes.js"

config();
connectDB();

const app = express()

// Body parsing middlwares
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// API Routes
app.use("/auth", authRoutes)

app.use("/chores", choreRoutes)

app.use("/rooms", roomRoutes)


// Load OpenAPI YAML doc
const openapiDocument = YAML.load("./src/docs/openapi.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));


const PORT = 5050;

app.listen(PORT,()=>{
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

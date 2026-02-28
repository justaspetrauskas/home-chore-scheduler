import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { getCleaningEvents, createCleaningEvent } from "../controllers/cleaningEventController.js"

const router = express.Router()

// Use middleware before making request to the following routes
router.use(authMiddleware)
router.get("/", getCleaningEvents)
router.post("/", createCleaningEvent)


export default router
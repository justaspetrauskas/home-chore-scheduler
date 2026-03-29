import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { getCleaningEvents, createCleaningEvent, updateCleaningEvent, deleteCleaningEvent } from "../controllers/cleaningEventController.js"
import { validateRequest } from "../middlewares/validateRequestMiddleware.js"
import { createCleaningEventSchema, updateCleaningEventSchema } from "../validators/cleaningEventValidators.js"

const router = express.Router()

// Use middleware before making request to the following routes
router.use(authMiddleware)
router.get("/", getCleaningEvents)
router.post("/", validateRequest(createCleaningEventSchema), createCleaningEvent)
router.patch("/:id", validateRequest(updateCleaningEventSchema), updateCleaningEvent)
router.delete("/:id", deleteCleaningEvent)


export default router
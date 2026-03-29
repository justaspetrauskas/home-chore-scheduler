import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { completeTaskAssignment } from "../controllers/taskAssignmentController.js"

const router = express.Router()

router.use(authMiddleware)
router.post("/:id/complete", completeTaskAssignment)

export default router

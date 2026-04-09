import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { assignChoreToTaskAssignment, completeTaskAssignment } from "../controllers/taskAssignmentController.js"
import { validateRequest } from "../middlewares/validateRequestMiddleware.js"
import { assignChoreToTaskAssignmentSchema } from "../validators/taskAssignmentValidators.js"

const router = express.Router()

router.use(authMiddleware)
router.patch("/:id/chore", validateRequest(assignChoreToTaskAssignmentSchema), assignChoreToTaskAssignment)
router.post("/:id/complete", completeTaskAssignment)

export default router

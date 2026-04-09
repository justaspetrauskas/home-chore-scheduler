import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { createChore, updateChore, deleteChore, getAllChores, getSuggestedChores, getChoreById } from "../controllers/choresController.js"
import { validateRequest } from "../middlewares/validateRequestMiddleware.js"
import { createChoreSchema, updateChoreSchema } from "../validators/choresValidator.js"

const router = express.Router()

router.use(authMiddleware)

router.get("/", getAllChores)
router.get("/suggestions", getSuggestedChores)
router.get("/:id", getChoreById)
router.post("/", validateRequest(createChoreSchema), createChore)
router.delete("/:id", deleteChore)
router.put("/:id", validateRequest(updateChoreSchema), updateChore)


export default router
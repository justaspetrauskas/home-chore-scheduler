import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { createChore, updateChore, deleteChore, getAllChores, getChoreById } from "../controllers/choresController.js"
import { validateRequest } from "../middlewares/validateRequestMiddleware.js"
import { createChoreSchema, updateChoreSchema } from "../validators/choresValidator.js"

const router = express.Router()


router.get("/",getAllChores)
router.get("/:id",getChoreById)
// Use middleware before making request to the following routes
router.use(authMiddleware)
router.post("/", validateRequest(createChoreSchema),createChore)
router.delete("/:id",deleteChore)
router.put("/:id",validateRequest(updateChoreSchema),updateChore)


export default router
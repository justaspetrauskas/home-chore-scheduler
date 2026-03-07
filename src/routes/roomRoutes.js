import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import {
    createRoom,
    getRoomsByHousehold,
    getRoomById,
    updateRoom,
    deleteRoom
} from "../controllers/roomController.js"

const router = express.Router()

// all routes require authentication
router.use(authMiddleware)

// create a new room
router.post('/', createRoom)

// get all rooms for a household
router.get('/household/:householdId', getRoomsByHousehold)

// get a specific room by ID
router.get('/:id', getRoomById)

// update a room
router.put('/:id', updateRoom)

// delete a room
router.delete('/:id', deleteRoom)

export default router
import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { 
    getUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getMe
} from "../controllers/userController.js"

const router = express.Router()
router.use(authMiddleware)

router.get('/', getAllUsers)            // list users
router.get('/me', getMe)               // current user profile
router.get('/:id', getUser)            // single user
router.put('/:id', updateUser)         // update user data
router.delete('/:id', deleteUser)      // delete user

export default router

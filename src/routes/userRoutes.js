import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { 
    getUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getMe,
    setDefaultHousehold
} from "../controllers/userController.js"


const router = express.Router()
router.use(authMiddleware)

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: "Uses controller: getAllUsers"
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', getAllUsers)

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: "Uses controller: getMe"
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get('/me', getMe)

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: "Uses controller: getUser"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's unique ID
 *     responses:
 *       200:
 *         description: User found
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: "Uses controller: updateUser"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's unique ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: "Uses controller: deleteUser"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's unique ID
 *     responses:
 *       200:
 *         description: User deleted
 */
router.get('/:id', getUser)
router.put('/:id', updateUser)

// Set default household
router.post('/default-household', setDefaultHousehold)

export default router

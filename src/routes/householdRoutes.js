import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import {
  createHousehold,
  getUserHouseholds,
  getHouseholdById,
  createInvitation,
  inviteMember,
  removeMember,
  deleteHousehold,
  setDefaultHouseholdForUser,
  createRoomForHousehold,
  createRoomsBulk
} from "../controllers/householdController.js"

const router = express.Router()
router.use(authMiddleware)

router.post('/', createHousehold)
router.get('/', getUserHouseholds)
router.get('/:id', getHouseholdById)
router.post('/:id/invite', createInvitation)
router.post('/:householdId/invite', inviteMember)
router.delete('/:householdId/members/:userId', removeMember)
router.delete('/:id', deleteHousehold)
router.post('/:householdId/set-default', setDefaultHouseholdForUser)

router.post('/:householdId/rooms', createRoomForHousehold)
// Bulk create rooms for a household
router.post('/:householdId/rooms/bulk', createRoomsBulk)

export default router

import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import {
  createHousehold,
  getUserHouseholds,
  getHouseholdById,
  inviteMember,
  removeMember,
  deleteHousehold,
  setDefaultHouseholdForUser
} from "../controllers/householdController.js"

const router = express.Router()
router.use(authMiddleware)

router.post('/', createHousehold)
router.get('/', getUserHouseholds)
router.get('/:id', getHouseholdById)
router.post('/:householdId/invite', inviteMember)
router.delete('/:householdId/members/:userId', removeMember)
router.delete('/:id', deleteHousehold)
router.post('/:householdId/set-default', setDefaultHouseholdForUser)

export default router

import express from "express"
import { handleTelegramWebhook } from "../controllers/webhookController.js"

const router = express.Router()

router.post("/telegram", handleTelegramWebhook)

export default router
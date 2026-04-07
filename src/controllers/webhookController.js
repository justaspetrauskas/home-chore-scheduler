import { createTelegramService } from "../services/telegram.service.js"

const hasValidTelegramSecret = (req) => {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!expectedSecret) return true

  const providedSecret = req.get("x-telegram-bot-api-secret-token")
  return providedSecret === expectedSecret
}

const getTelegramService = () => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN ?? process.env.TBOT_TOKEN
  if (!botToken) return null

  return createTelegramService(botToken)
}

const handleTelegramWebhook = async (req, res) => {
  if (!hasValidTelegramSecret(req)) {
    return res.status(401).json({ error: "Invalid Telegram webhook secret" })
  }

  const update = req.body || {}

  try {
    const telegram = getTelegramService()
    const message = update.message
    const callbackQuery = update.callback_query

    if (telegram && message?.chat?.id && typeof message?.text === "string") {
      const text = message.text.trim()

      if (text === "/start") {
        await telegram.sendMessage({
          chatId: message.chat.id,
          text: "Bot connected! You will receive chore reminders here.",
        })
      }
    }

    if (telegram && callbackQuery?.id) {
      await telegram.answerCallbackQuery({
        callbackQueryId: callbackQuery.id,
      })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook processing error:", error)
    return res.status(200).json({ ok: true })
  }
}

export { handleTelegramWebhook }
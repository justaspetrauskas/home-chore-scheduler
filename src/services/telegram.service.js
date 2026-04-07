export class TelegramService {
  constructor(config) {
    if (!config?.botToken?.trim()) {
      throw new Error("TelegramService requires a valid botToken")
    }

    this.token = config.botToken
    this.baseUrl = config.baseUrl ?? "https://api.telegram.org"
    this.timeoutMs = config.timeoutMs ?? 10_000
  }

  async getMe() {
    return this.request("getMe")
  }

  async sendMessage(params) {
    const body = {
      chat_id: params.chatId,
      text: params.text,
      parse_mode: params.parseMode,
      disable_web_page_preview: params.disableWebPagePreview,
      disable_notification: params.disableNotification,
      reply_to_message_id: params.replyToMessageId,
    }

    return this.request("sendMessage", body)
  }

  async sendMessageWithButtons(chatId, text, buttons) {
  return this.sendMessage({
    chatId,
    text,
    replyMarkup: {
      inline_keyboard: buttons
    }
  })
}

  async sendMarkdownMessage(chatId, text) {
    return this.sendMessage({ chatId, text, parseMode: "Markdown" })
  }

  async sendHtmlMessage(chatId, text) {
    return this.sendMessage({ chatId, text, parseMode: "HTML" })
  }

  async answerCallbackQuery(params) {
    const body = {
      callback_query_id: params.callbackQueryId,
      text: params.text,
      show_alert: params.showAlert,
    }

    return this.request("answerCallbackQuery", body)
  }

  async setWebhook(url) {
    return this.request("setWebhook", { url })
  }

  async deleteWebhook(dropPendingUpdates = false) {
    return this.request("deleteWebhook", {
      drop_pending_updates: dropPendingUpdates,
    })
  }

  async getUpdates(offset) {
    const body = offset ? { offset } : undefined
    return this.request("getUpdates", body)
  }

  async request(method, body) {
    const endpoint = `${this.baseUrl}/bot${this.token}/${method}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.cleanBody(body)),
        signal: controller.signal,
      })

      const payload = await response.json()

      if (!response.ok || !payload.ok || payload.result === undefined) {
        throw new Error(
          `Telegram API request failed (${method}): ${payload.description ?? response.statusText}`,
        )
      }

      return payload.result
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Telegram API request timed out (${method})`)
      }

      throw error
    } finally {
      clearTimeout(timer)
    }
  }

  cleanBody(body) {
    if (!body) return undefined

    return Object.fromEntries(
      Object.entries(body).filter(([, value]) => value !== undefined),
    )
  }
}

export const createTelegramService = (botToken = process.env.TBOT_TOKEN ?? "") => {
  return new TelegramService({ botToken })
}
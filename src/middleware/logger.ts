import type { Middleware } from "telegraf"
import type { BotContext } from "../types"
import { logger } from "../utils/logger"

export const loggerMiddleware: Middleware<BotContext> = async (ctx, next) => {
  const start = Date.now()

  // Log incoming message
  if (ctx.message) {
    const userId = ctx.from?.id
    const username = ctx.from?.username
    const messageText = "text" in ctx.message ? ctx.message.text : "[non-text message]"

    logger.info(`Received message from ${username || userId}: ${messageText}`)
  }

  // Process next middleware
  await next()

  // Log response time
  const ms = Date.now() - start
  logger.debug(`Response time: ${ms}ms`)
}


import type { Telegraf } from "telegraf"
import type { BotContext } from "../types"
import { authMiddleware } from "./auth"
import { loggerMiddleware } from "./logger"

export const setupMiddleware = (bot: Telegraf<BotContext>) => {
  // Logger middleware
  bot.use(loggerMiddleware)

  // Auth middleware
  bot.use(authMiddleware)
}


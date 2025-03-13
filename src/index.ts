import { Telegraf, session } from "telegraf"
import dotenv from "dotenv"
import { setupCommands } from "./commands"
import { setupMiddleware } from "./middleware"
import { setupListeners } from "./listeners"
import type { BotContext } from "./types"
import { logger } from "./utils/logger"

// Load environment variables
dotenv.config()

// Initialize the bot
const bot = new Telegraf<BotContext>(process.env.TELEGRAM_BOT_TOKEN || "")

// Setup session middleware
bot.use(session())

// Initialize context defaults
bot.use((ctx, next) => {
  if (!ctx.session) {
    ctx.session = {
      isAuthenticated: false,
      authToken: null,
      refreshToken: null,
      user: null,
      currentStep: null,
      tempData: {},
    }
  }
  return next()
})

// Setup middleware
setupMiddleware(bot)

// Setup commands
setupCommands(bot)

// Setup message listeners
setupListeners(bot)

// Error handling
bot.catch((err, ctx) => {
  logger.error(`Error for ${ctx.updateType}`, err)
  ctx.reply("An error occurred while processing your request. Please try again later.")
})

// Start the bot
bot
  .launch()
  .then(() => {
    logger.info("Bot started successfully")
  })
  .catch((err) => {
    logger.error("Failed to start bot", err)
  })

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))


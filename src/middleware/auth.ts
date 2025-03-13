import type { Middleware } from "telegraf"
import type { BotContext } from "../types"

// Middleware to check auth token expiry and refresh if needed
export const authMiddleware: Middleware<BotContext> = async (ctx, next) => {
  // If user is authenticated, check token expiry
  if (ctx.session?.isAuthenticated && ctx.session?.authToken) {
    // In a real implementation, you would check token expiry
    // and refresh if needed
  }

  return next()
}

// Higher-order function to require authentication for commands
export const requireAuth = (fn: (ctx: BotContext) => Promise<void>) => {
  return async (ctx: BotContext) => {
    if (!ctx.session?.isAuthenticated) {
      await ctx.reply("You need to be logged in to use this command. Please use /login to authenticate.")
      return
    }

    return fn(ctx)
  }
}


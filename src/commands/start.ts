import { Markup } from "telegraf"
import type { BotContext } from "../types"

export const startCommand = async (ctx: BotContext) => {
  const welcomeMessage = `
Welcome to the Copperx Telegram Bot! 🚀

This bot allows you to manage your Copperx account directly from Telegram.

*Available Commands:*
/login - Login to your Copperx account
/balance - Check your wallet balances
/send - Send funds to email or wallet
/withdraw - Withdraw funds to bank account
/history - View transaction history
/profile - View your profile
/help - Get help with using the bot
/logout - Logout from your account

Need help? Join our community: https://t.me/copperxcommunity/2183
`

  await ctx.replyWithMarkdown(
    welcomeMessage,
    Markup.keyboard([
      ["💰 Balance", "📤 Send", "🏦 Withdraw"],
      ["📋 History", "👤 Profile", "❓ Help"],
    ]).resize(),
  )
}


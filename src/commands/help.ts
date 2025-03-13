import { Markup } from "telegraf"
import type { BotContext } from "../types"

export const helpCommand = async (ctx: BotContext) => {
  const helpMessage = `
*Copperx Bot Help*

*Authentication Commands:*
/login - Login to your Copperx account
/logout - Logout from your account

*Wallet Commands:*
/balance - Check your wallet balances
/send - Send funds to email or wallet
/withdraw - Withdraw funds to bank account
/history - View transaction history

*Profile Commands:*
/profile - View your profile and verification status

*Other Commands:*
/help - Show this help message
/start - Restart the bot

Need more help? Join our community: https://t.me/copperxcommunity/2183
`

  await ctx.replyWithMarkdown(
    helpMessage,
    Markup.keyboard([
      ["💰 Balance", "📤 Send", "🏦 Withdraw"],
      ["📋 History", "👤 Profile", "❓ Help"],
    ]).resize(),
  )
}


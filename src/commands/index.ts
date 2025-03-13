import type { Telegraf } from "telegraf"
import type { BotContext } from "../types"
import { startCommand } from "./start"
import { loginCommand, logoutCommand } from "./auth"
import { balanceCommand } from "./balance"
import { sendCommand } from "./send"
import { withdrawCommand } from "./withdraw"
import { historyCommand } from "./history"
import { profileCommand } from "./profile"
import { helpCommand } from "./help"

export const setupCommands = (bot: Telegraf<BotContext>) => {
  // Start command
  bot.command("start", startCommand)

  // Auth commands
  bot.command("login", loginCommand)
  bot.command("logout", logoutCommand)

  // Wallet commands
  bot.command("balance", balanceCommand)

  // Transfer commands
  bot.command("send", sendCommand)
  bot.command("withdraw", withdrawCommand)
  bot.command("history", historyCommand)

  // Profile commands
  bot.command("profile", profileCommand)

  // Help command
  bot.command("help", helpCommand)

  // Register commands with Telegram
  bot.telegram.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "login", description: "Login to your Copperx account" },
    { command: "balance", description: "Check your wallet balances" },
    { command: "send", description: "Send funds to email or wallet" },
    { command: "withdraw", description: "Withdraw funds to bank account" },
    { command: "history", description: "View transaction history" },
    { command: "profile", description: "View your profile" },
    { command: "help", description: "Get help with using the bot" },
    { command: "logout", description: "Logout from your account" },
  ])
}


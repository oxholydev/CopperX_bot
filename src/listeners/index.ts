import type { Telegraf } from "telegraf"
import { message } from "telegraf/filters"
import type { BotContext } from "../types"
import { handleEmailInput, handleOtpInput } from "../commands/auth"
import {
  handleEmailRecipientInput,
  handleWalletRecipientInput,
  handleAmountInput,
  handleDescriptionInput,
  handleSendMethodSelection,
  handleNetworkSelection,
  handleSendConfirmation,
} from "../commands/send"
import {
  handleWithdrawAmountInput,
  handleBankSelection,
  handleWithdrawDescriptionInput,
  handleWithdrawConfirmation,
} from "../commands/withdraw"
import { handleSetDefaultWallet } from "../commands/balance"
import { balanceCommand } from "../commands/balance"
import { sendCommand } from "../commands/send"
import { withdrawCommand } from "../commands/withdraw"
import { historyCommand } from "../commands/history"
import { profileCommand } from "../commands/profile"
import { helpCommand } from "../commands/help"

export const setupListeners = (bot: Telegraf<BotContext>) => {
  // Handle text messages based on current step
  bot.on(message("text"), async (ctx) => {
    const text = ctx.message.text

    // Handle keyboard shortcuts
    if (text === "💰 Balance") {
      return balanceCommand(ctx)
    } else if (text === "📤 Send") {
      return sendCommand(ctx)
    } else if (text === "🏦 Withdraw") {
      return withdrawCommand(ctx)
    } else if (text === "📋 History") {
      return historyCommand(ctx)
    } else if (text === "👤 Profile") {
      return profileCommand(ctx)
    } else if (text === "❓ Help") {
      return helpCommand(ctx)
    }

    // Handle step-based inputs
    switch (ctx.session?.currentStep) {
      case "waiting_email":
        return handleEmailInput(ctx, text)
      case "waiting_otp":
        return handleOtpInput(ctx, text)
      case "send_email_recipient":
        return handleEmailRecipientInput(ctx, text)
      case "send_wallet_recipient":
        return handleWalletRecipientInput(ctx, text)
      case "send_amount":
        return handleAmountInput(ctx, text)
      case "send_description":
        return handleDescriptionInput(ctx, text)
      case "withdraw_amount":
        return handleWithdrawAmountInput(ctx, text)
      case "withdraw_description":
        return handleWithdrawDescriptionInput(ctx, text)
      default:
        // If no specific step is active, just acknowledge the message
        if (ctx.session?.isAuthenticated) {
          await ctx.reply("Use the commands or buttons below to interact with the bot.")
        } else {
          await ctx.reply("Please use /login to authenticate or /help to see available commands.")
        }
    }
  })

  // Handle callback queries
  bot.on("callback_query", async (ctx) => {
    const callbackData = ctx.callbackQuery.data

    if (!callbackData) return

    // Parse callback data (format: action:value)
    const [action, value] = callbackData.split(":")

    switch (action) {
      case "send_method":
        return handleSendMethodSelection(ctx, value)
      case "send_network":
        return handleNetworkSelection(ctx, value)
      case "send_confirm":
        return handleSendConfirmation(ctx, value)
      case "withdraw_bank":
        return handleBankSelection(ctx, value)
      case "withdraw_confirm":
        return handleWithdrawConfirmation(ctx, value)
      case "set_default_wallet":
        return handleSetDefaultWallet(ctx, value)
      default:
        await ctx.answerCbQuery("Unknown action")
    }
  })

  // Setup notification listeners
  bot.on("message", async (ctx) => {
    // If user is authenticated, setup notification listeners
    if (ctx.session?.isAuthenticated && ctx.session?.user?.organizationId) {
      // In a real implementation, you would setup Pusher listeners here
      // This would be done in a more persistent way, not on every message
    }
  })
}


import { Markup } from "telegraf"
import type { BotContext } from "../types"
import { withdrawToBank } from "../api/transfer"
import { requireAuth } from "../middleware/auth"

export const withdrawCommand = requireAuth(async (ctx: BotContext) => {
  // Reset any previous state
  ctx.session.tempData = {}

  // In a real implementation, you would fetch the user's bank accounts
  // For this example, we'll use a placeholder
  await ctx.reply(
    "Please note that bank withdrawals have a minimum amount requirement.\n\nPlease enter the amount to withdraw (in USDC):",
  )

  ctx.session.currentStep = "withdraw_amount"
})

// Handle amount input
export const handleWithdrawAmountInput = async (ctx: BotContext, amountStr: string) => {
  // Validate amount
  const amount = Number.parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    await ctx.reply("Please enter a valid amount greater than 0.")
    return
  }

  ctx.session.tempData.amount = amountStr

  // In a real implementation, you would fetch the user's bank accounts
  // For this example, we'll use placeholders
  await ctx.reply(
    "Please select your bank account:",
    Markup.inlineKeyboard([
      Markup.button.callback("My Bank Account (ending in 1234)", "withdraw_bank:bank1"),
      Markup.button.callback("Add New Bank Account", "withdraw_bank:new"),
    ]),
  )

  ctx.session.currentStep = "withdraw_bank"
}

// Handle bank selection
export const handleBankSelection = async (ctx: BotContext, bankId: string) => {
  await ctx.answerCbQuery()

  if (bankId === "new") {
    await ctx.reply("To add a new bank account, please visit the Copperx web app: https://app.copperx.io")
    ctx.session.currentStep = null
    return
  }

  ctx.session.tempData.bankAccountId = bankId
  await ctx.reply('Please enter a description (optional) or type "skip":')
  ctx.session.currentStep = "withdraw_description"
}

// Handle description input
export const handleWithdrawDescriptionInput = async (ctx: BotContext, description: string) => {
  if (description.toLowerCase() !== "skip") {
    ctx.session.tempData.description = description
  }

  // Show confirmation
  let confirmMessage = "*Please confirm the withdrawal:*\n\n"
  confirmMessage += `*Amount:* ${ctx.session.tempData.amount} USDC\n`
  confirmMessage += `*Bank Account:* ending in 1234\n`

  if (ctx.session.tempData.description) {
    confirmMessage += `*Description:* ${ctx.session.tempData.description}\n`
  }

  await ctx.replyWithMarkdown(
    confirmMessage,
    Markup.inlineKeyboard([
      Markup.button.callback("Confirm", "withdraw_confirm:yes"),
      Markup.button.callback("Cancel", "withdraw_confirm:no"),
    ]),
  )

  ctx.session.currentStep = "withdraw_confirm"
}

// Handle confirmation
export const handleWithdrawConfirmation = async (ctx: BotContext, confirm: string) => {
  await ctx.answerCbQuery()

  if (confirm === "no") {
    await ctx.reply("Withdrawal cancelled.")
    ctx.session.currentStep = null
    return
  }

  await ctx.reply("Processing your withdrawal...")

  try {
    const response = await withdrawToBank(
      ctx.session.authToken!,
      ctx.session.tempData.amount,
      ctx.session.tempData.bankAccountId,
      ctx.session.tempData.description,
    )

    if (!response.success) {
      await ctx.reply(`Withdrawal failed: ${response.error?.message}`)
      return
    }

    await ctx.reply("Withdrawal submitted successfully! You can check the status with /history.")
  } catch (error) {
    await ctx.reply(`An error occurred: ${error.message}`)
  } finally {
    ctx.session.currentStep = null
  }
}


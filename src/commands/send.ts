import { Markup } from "telegraf"
import type { BotContext } from "../types"
import { sendEmailTransfer, sendWalletTransfer } from "../api/transfer"
import { requireAuth } from "../middleware/auth"

export const sendCommand = requireAuth(async (ctx: BotContext) => {
  // Reset any previous state
  ctx.session.tempData = {}

  await ctx.reply(
    "How would you like to send funds?",
    Markup.inlineKeyboard([
      Markup.button.callback("Send to Email", "send_method:email"),
      Markup.button.callback("Send to Wallet Address", "send_method:wallet"),
    ]),
  )
})

// Handle send method selection
export const handleSendMethodSelection = async (ctx: BotContext, method: string) => {
  await ctx.answerCbQuery()

  ctx.session.tempData.sendMethod = method

  if (method === "email") {
    await ctx.reply("Please enter the recipient's email address:")
    ctx.session.currentStep = "send_email_recipient"
  } else if (method === "wallet") {
    await ctx.reply("Please enter the recipient's wallet address:")
    ctx.session.currentStep = "send_wallet_recipient"
  }
}

// Handle email recipient input
export const handleEmailRecipientInput = async (ctx: BotContext, email: string) => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    await ctx.reply("Please enter a valid email address.")
    return
  }

  ctx.session.tempData.recipient = email
  await ctx.reply("Please enter the amount to send (in USDC):")
  ctx.session.currentStep = "send_amount"
}

// Handle wallet recipient input
export const handleWalletRecipientInput = async (ctx: BotContext, address: string) => {
  // Basic validation for wallet address
  if (address.trim().length < 10) {
    await ctx.reply("Please enter a valid wallet address.")
    return
  }

  ctx.session.tempData.recipient = address

  // Get networks for selection
  await ctx.reply(
    "Please select the network:",
    Markup.inlineKeyboard([
      Markup.button.callback("Ethereum", "send_network:ethereum"),
      Markup.button.callback("Polygon", "send_network:polygon"),
      Markup.button.callback("Solana", "send_network:solana"),
    ]),
  )
  ctx.session.currentStep = "send_network"
}

// Handle network selection
export const handleNetworkSelection = async (ctx: BotContext, network: string) => {
  await ctx.answerCbQuery()

  ctx.session.tempData.network = network
  await ctx.reply("Please enter the amount to send (in USDC):")
  ctx.session.currentStep = "send_amount"
}

// Handle amount input
export const handleAmountInput = async (ctx: BotContext, amountStr: string) => {
  // Validate amount
  const amount = Number.parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    await ctx.reply("Please enter a valid amount greater than 0.")
    return
  }

  ctx.session.tempData.amount = amountStr
  await ctx.reply('Please enter a description (optional) or type "skip":')
  ctx.session.currentStep = "send_description"
}

// Handle description input
export const handleDescriptionInput = async (ctx: BotContext, description: string) => {
  if (description.toLowerCase() !== "skip") {
    ctx.session.tempData.description = description
  }

  // Show confirmation
  let confirmMessage = "*Please confirm the transaction:*\n\n"

  if (ctx.session.tempData.sendMethod === "email") {
    confirmMessage += `*Recipient Email:* ${ctx.session.tempData.recipient}\n`
  } else {
    confirmMessage += `*Recipient Address:* ${ctx.session.tempData.recipient}\n`
    confirmMessage += `*Network:* ${ctx.session.tempData.network}\n`
  }

  confirmMessage += `*Amount:* ${ctx.session.tempData.amount} USDC\n`

  if (ctx.session.tempData.description) {
    confirmMessage += `*Description:* ${ctx.session.tempData.description}\n`
  }

  await ctx.replyWithMarkdown(
    confirmMessage,
    Markup.inlineKeyboard([
      Markup.button.callback("Confirm", "send_confirm:yes"),
      Markup.button.callback("Cancel", "send_confirm:no')  'send_confirm:yes"),
      Markup.button.callback("Cancel", "send_confirm:no"),
    ]),
  )

  ctx.session.currentStep = "send_confirm"
}

// Handle confirmation
export const handleSendConfirmation = async (ctx: BotContext, confirm: string) => {
  await ctx.answerCbQuery()

  if (confirm === "no") {
    await ctx.reply("Transaction cancelled.")
    ctx.session.currentStep = null
    return
  }

  await ctx.reply("Processing your transaction...")

  try {
    let response

    if (ctx.session.tempData.sendMethod === "email") {
      // Send to email
      response = await sendEmailTransfer(
        ctx.session.authToken!,
        ctx.session.tempData.recipient,
        ctx.session.tempData.amount,
        ctx.session.tempData.description,
      )
    } else {
      // Send to wallet
      response = await sendWalletTransfer(
        ctx.session.authToken!,
        ctx.session.tempData.recipient,
        ctx.session.tempData.amount,
        ctx.session.tempData.network,
        ctx.session.tempData.description,
      )
    }

    if (!response.success) {
      await ctx.reply(`Transaction failed: ${response.error?.message}`)
      return
    }

    await ctx.reply("Transaction submitted successfully! You can check the status with /history.")
  } catch (error) {
    await ctx.reply(`An error occurred: ${error.message}`)
  } finally {
    ctx.session.currentStep = null
  }
}


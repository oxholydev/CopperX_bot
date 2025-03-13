import type { BotContext } from "../types"
import { getTransactions } from "../api/transfer"
import { requireAuth } from "../middleware/auth"

export const historyCommand = requireAuth(async (ctx: BotContext) => {
  await ctx.reply("Fetching your recent transactions...")

  const response = await getTransactions(ctx.session.authToken!, 1, 10)
  if (!response.success) {
    return ctx.reply(`Failed to get transactions: ${response.error?.message}`)
  }

  const transactions = response.data || []

  if (transactions.length === 0) {
    return ctx.reply("You don't have any transactions yet.")
  }

  let message = "*Your Recent Transactions*\n\n"

  transactions.forEach((tx, index) => {
    message += `*${index + 1}. ${tx.type}*\n`
    message += `Amount: ${tx.amount} USDC\n`
    message += `Status: ${tx.status}\n`
    message += `Date: ${new Date(tx.createdAt).toLocaleString()}\n`

    if (tx.recipient) {
      message += `Recipient: ${tx.recipient}\n`
    }

    if (tx.description) {
      message += `Description: ${tx.description}\n`
    }

    message += "\n"
  })

  await ctx.replyWithMarkdown(message)
})


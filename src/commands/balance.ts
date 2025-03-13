import { Markup } from "telegraf"
import type { BotContext } from "../types"
import { getWalletBalances, getWallets, setDefaultWallet } from "../api/wallet"
import { requireAuth } from "../middleware/auth"

export const balanceCommand = requireAuth(async (ctx: BotContext) => {
  await ctx.reply("Fetching your wallet balances...")

  // Get wallet balances
  const balancesResponse = await getWalletBalances(ctx.session.authToken!)
  if (!balancesResponse.success) {
    return ctx.reply(`Failed to get balances: ${balancesResponse.error?.message}`)
  }

  // Get wallets for additional info
  const walletsResponse = await getWallets(ctx.session.authToken!)
  if (!walletsResponse.success) {
    return ctx.reply(`Failed to get wallets: ${walletsResponse.error?.message}`)
  }

  const wallets = walletsResponse.data || []
  const balances = balancesResponse.data || {}

  if (wallets.length === 0) {
    return ctx.reply("You don't have any wallets yet.")
  }

  // Format wallet balances
  let message = "*Your Wallet Balances*\n\n"

  wallets.forEach((wallet) => {
    const balance = balances[wallet.id] || "0.00"
    const defaultMark = wallet.isDefault ? " (Default)" : ""
    message += `*${wallet.name}${defaultMark}*\n`
    message += `Network: ${wallet.network}\n`
    message += `Balance: ${balance} USDC\n`
    message += `Address: \`${wallet.address}\`\n\n`
  })

  message += "Want to set a default wallet? Use the buttons below:"

  // Create inline keyboard for setting default wallet
  const buttons = wallets.map((wallet) =>
    Markup.button.callback(`Set ${wallet.name} as default`, `set_default_wallet:${wallet.id}`),
  )

  const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 })

  await ctx.replyWithMarkdown(message, keyboard)
})

// Handle setting default wallet
export const handleSetDefaultWallet = async (ctx: BotContext, walletId: string) => {
  if (!ctx.session.isAuthenticated) {
    await ctx.answerCbQuery("You need to be logged in to perform this action.")
    return
  }

  await ctx.answerCbQuery("Setting default wallet...")

  const response = await setDefaultWallet(ctx.session.authToken!, walletId)
  if (!response.success) {
    return ctx.reply(`Failed to set default wallet: ${response.error?.message}`)
  }

  await ctx.reply("Default wallet updated successfully!")

  // Refresh balances
  await balanceCommand(ctx)
}


import type { BotContext } from "../types"
import { getUserProfile, getKycStatus } from "../api/auth"
import { requireAuth } from "../middleware/auth"

export const profileCommand = requireAuth(async (ctx: BotContext) => {
  await ctx.reply("Fetching your profile information...")

  // Get user profile
  const profileResponse = await getUserProfile(ctx.session.authToken!)
  if (!profileResponse.success) {
    return ctx.reply(`Failed to get profile: ${profileResponse.error?.message}`)
  }

  // Get KYC status
  const kycResponse = await getKycStatus(ctx.session.authToken!)
  if (!kycResponse.success) {
    return ctx.reply(`Failed to get KYC status: ${kycResponse.error?.message}`)
  }

  const user = profileResponse.data
  const kyc = kycResponse.data

  let message = "*Your Profile*\n\n"
  message += `*Name:* ${user.firstName} ${user.lastName}\n`
  message += `*Email:* ${user.email}\n\n`

  message += "*Verification Status*\n"
  message += `*KYC Status:* ${kyc.kycStatus || "Not started"}\n`
  message += `*KYB Status:* ${kyc.kybStatus || "Not applicable"}\n\n`

  if (kyc.kycStatus !== "approved") {
    message += "To complete your verification, please visit the Copperx web app: https://app.copperx.io"
  }

  await ctx.replyWithMarkdown(message)
})


import { Markup } from "telegraf"
import type { BotContext } from "../types"
import { requestEmailOtp, verifyEmailOtp, getUserProfile, setAuthToken } from "../api/auth"
import { logger } from "../utils/logger"

export const loginCommand = async (ctx: BotContext) => {
  // If already logged in
  if (ctx.session.isAuthenticated) {
    return ctx.reply("You are already logged in. Use /logout to log out first.")
  }

  await ctx.reply("Please enter your Copperx email address:")
  ctx.session.currentStep = "waiting_email"
}

export const logoutCommand = async (ctx: BotContext) => {
  // Check if user is authenticated
  if (!ctx.session.isAuthenticated) {
    return ctx.reply("You are not logged in. Use /login to log in.")
  }

  // Clear session data
  ctx.session.isAuthenticated = false
  ctx.session.authToken = null
  ctx.session.refreshToken = null
  ctx.session.user = null
  ctx.session.currentStep = null
  ctx.session.tempData = {}

  // Clear auth token from API
  setAuthToken(null)

  await ctx.reply("You have been logged out successfully.", Markup.keyboard([["/login", "/help"]]).resize())
}

// Handle email input
export const handleEmailInput = async (ctx: BotContext, email: string) => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    await ctx.reply("Please enter a valid email address.")
    return
  }

  // Store email in session
  ctx.session.tempData.email = email

  // Request OTP
  const response = await requestEmailOtp(email)
  if (!response.success) {
    await ctx.reply(`Failed to send OTP: ${response.error?.message}`)
    ctx.session.currentStep = null
    return
  }

  await ctx.reply(`An OTP has been sent to ${email}. Please enter the OTP:`)
  ctx.session.currentStep = "waiting_otp"
}

// Handle OTP input
export const handleOtpInput = async (ctx: BotContext, otp: string) => {
  const email = ctx.session.tempData.email

  // Validate OTP format (assuming 6 digits)
  if (!/^\d{6}$/.test(otp)) {
    await ctx.reply("Please enter a valid 6-digit OTP.")
    return
  }

  // Verify OTP
  const response = await verifyEmailOtp(email, otp)
  if (!response.success) {
    await ctx.reply(`Failed to verify OTP: ${response.error?.message}`)
    return
  }

  // Store tokens
  ctx.session.authToken = response.data?.token
  ctx.session.refreshToken = response.data?.refreshToken

  // Set auth token for API calls
  setAuthToken(ctx.session.authToken)

  // Get user profile
  const profileResponse = await getUserProfile(ctx.session.authToken!)
  if (!profileResponse.success) {
    await ctx.reply(`Failed to get user profile: ${profileResponse.error?.message}`)
    return
  }

  // Store user data
  ctx.session.user = profileResponse.data
  ctx.session.isAuthenticated = true
  ctx.session.currentStep = null

  logger.info(`User logged in: ${ctx.session.user.email}`)

  await ctx.reply(
    `Welcome, ${ctx.session.user.firstName}! You are now logged in.`,
    Markup.keyboard([
      ["💰 Balance", "📤 Send", "🏦 Withdraw"],
      ["📋 History", "👤 Profile", "❓ Help"],
    ]).resize(),
  )
}


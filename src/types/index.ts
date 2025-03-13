import type { Context } from "telegraf"

export interface UserData {
  id: string
  email: string
  firstName: string
  lastName: string
  organizationId: string
  kycStatus?: string
  kybStatus?: string
}

export interface Wallet {
  id: string
  name: string
  address: string
  network: string
  isDefault: boolean
  balance?: string
}

export interface Transaction {
  id: string
  type: string
  amount: string
  status: string
  createdAt: string
  recipient?: string
  description?: string
}

export interface SessionData {
  isAuthenticated: boolean
  authToken: string | null
  refreshToken: string | null
  user: UserData | null
  currentStep: string | null
  tempData: Record<string, any>
}

export interface BotContext extends Context {
  session: SessionData
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
  }
}


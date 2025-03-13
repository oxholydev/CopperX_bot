import axios from "axios"
import type { ApiResponse, Wallet } from "../types"
import { logger } from "../utils/logger"

const API_BASE_URL = process.env.API_BASE_URL || "https://income-api.copperx.io"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const getWallets = async (token: string): Promise<ApiResponse<Wallet[]>> => {
  try {
    const response = await api.get("/api/wallets", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return { success: true, data: response.data }
  } catch (error) {
    logger.error("Failed to get wallets", error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Failed to get wallets",
        code: error.response?.status?.toString() || "500",
      },
    }
  }
}

export const getWalletBalances = async (token: string): Promise<ApiResponse<any>> => {
  try {
    const response = await api.get("/api/wallets/balances", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return { success: true, data: response.data }
  } catch (error) {
    logger.error("Failed to get wallet balances", error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Failed to get wallet balances",
        code: error.response?.status?.toString() || "500",
      },
    }
  }
}

export const setDefaultWallet = async (token: string, walletId: string): Promise<ApiResponse<any>> => {
  try {
    const response = await api.post(
      "/api/wallets/default",
      { walletId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return { success: true, data: response.data }
  } catch (error) {
    logger.error("Failed to set default wallet", error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Failed to set default wallet",
        code: error.response?.status?.toString() || "500",
      },
    }
  }
}

export const getDefaultWallet = async (token: string): Promise<ApiResponse<Wallet>> => {
  try {
    const response = await api.get("/api/wallets/default", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return { success: true, data: response.data }
  } catch (error) {
    logger.error("Failed to get default wallet", error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Failed to get default wallet",
        code: error.response?.status?.toString() || "500",
      },
    }
  }
}


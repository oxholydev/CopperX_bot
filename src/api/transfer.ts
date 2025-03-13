import axios from "axios"
import type { ApiResponse, Transaction } from "../types"
import { logger } from "../utils/logger"

const API_BASE_URL = process.env.API_BASE_URL || "https://income-api.copperx.io"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const getTransactions = async (token: string, page = 1, limit = 10): Promise<ApiResponse<Transaction[]>> => {
  try {
    const response = await api.get(`/api/transfers?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return { success: true, data: response.data }
  } catch (error) {
    logger.error("Failed to get transactions", error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Failed to get transactions",
        code: error.response?.status?.toString() || "500",
      },
    }
  }
}

export const sendEmailTransfer = async (
  token: string,
  recipientEmail: string,
  amount: string,
  description?: string,
): Promise<ApiResponse<any>> => {
  try {
    const response = await api.post(
      "/api/transfers/send",
      {
        recipientEmail,
        amount,
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return { success: true, data: response.data }
  } catch (error) {
    logger.error("Failed to send email transfer", error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Failed to send email transfer",
        code: error.response?.status?.toString() || "500",
      },
    }
  }
}

export const sendWalletTransfer = async (
  token: string,
  recipientAddress: string,
  amount: string,
  network: string,
  description?: string,
): Promise<ApiResponse<any>> => {
  try {
    const response = await api.post(
      "/api/transfers/wallet-withdraw",
      {
        recipientAddress,
        amount,
        network,
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return { success: true, data: response.data }
  } catch (error) {
    logger.error("Failed to send wallet transfer", error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Failed to send wallet transfer",
        code: error.response?.status?.toString() || "500",
      },
    }
  }
}

export const withdrawToBank = async (
  token: string,
  amount: string,
  bankAccountId: string,
  description?: string,
): Promise<ApiResponse<any>> => {
  try {
    const response = await api.post(
      "/api/transfers/offramp",
      {
        amount,
        bankAccountId,
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return { success: true, data: response.data }
  } catch (error) {
    logger.error("Failed to withdraw to bank", error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Failed to withdraw to bank",
        code: error.response?.status?.toString() || "500",
      },
    }
  }
}


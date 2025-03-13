import axios from "axios"
import type { ApiResponse, UserData } from "../types"
import { logger } from "../utils/logger"

const API_BASE_URL = process.env.API_BASE_URL || "https://income-api.copperx.io"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response.status === 401 && !originalRequest._retry && originalRequest.headers["Authorization"]) {
      originalRequest._retry = true
      try {
        // Implement token refresh logic here
        // This would require storing the refresh token and user context
        return api(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  },
)

export const requestEmailOtp = async (email: string): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post("/api/auth/email-otp/request", { email })
    return { success: true, data: response.data }
  } catch (error) {
    logger.error("Failed to request OTP", error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Failed to request OTP",
        code: error.response?.status?.toString() || "500",
      },
    }
  }
}

export const verifyEmailOtp = async (
  email: string,
  otp: string,
): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
  try {
    const response = await api.post("/api/auth/email-otp/authenticate", { email, otp })
    return { success: true, data: response.data }
  } catch (error) {
    logger.error("Failed to verify OTP", error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Failed to verify OTP",
        code: error.response?.status?.toString() || "500",
      },
    }
  }
}

export const getUserProfile = async (token: string): Promise<ApiResponse<UserData>> => {
  try {
    const response = await api.get("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return { success: true, data: response.data }
  } catch (error) {
    logger.error("Failed to get user profile", error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Failed to get user profile",
        code: error.response?.status?.toString() || "500",
      },
    }
  }
}

export const getKycStatus = async (token: string): Promise<ApiResponse<any>> => {
  try {
    const response = await api.get("/api/kycs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return { success: true, data: response.data }
  } catch (error) {
    logger.error("Failed to get KYC status", error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Failed to get KYC status",
        code: error.response?.status?.toString() || "500",
      },
    }
  }
}

// Helper function to set auth token for all future requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common["Authorization"]
  }
}


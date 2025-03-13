import axios from "axios"
import Pusher from "pusher-js"
import type { ApiResponse } from "../types"
import { logger } from "../utils/logger"

const API_BASE_URL = process.env.API_BASE_URL || "https://income-api.copperx.io"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Initialize Pusher
const pusher = new Pusher(process.env.PUSHER_KEY || "", {
  cluster: process.env.PUSHER_CLUSTER || "eu",
  authEndpoint: `${API_BASE_URL}/api/notifications/auth`,
})

export const authenticatePusher = async (
  token: string,
  socketId: string,
  channel: string,
): Promise<ApiResponse<any>> => {
  try {
    const response = await api.post(
      "/api/notifications/auth",
      {
        socket_id: socketId,
        channel_name: channel,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return { success: true, data: response.data }
  } catch (error) {
    logger.error("Failed to authenticate Pusher", error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Failed to authenticate Pusher",
        code: error.response?.status?.toString() || "500",
      },
    }
  }
}

export const subscribeToNotifications = (organizationId: string, callback: (data: any) => void) => {
  const channel = pusher.subscribe(`private-org-${organizationId}`)

  channel.bind("deposit", (data: any) => {
    logger.info("Received deposit notification", data)
    callback(data)
  })

  return () => {
    channel.unbind_all()
    pusher.unsubscribe(`private-org-${organizationId}`)
  }
}


import api from "./api"

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await api.get("/notifications/")
    return response.data
  } catch (error) {
    console.error("Error in getUnreadCount:", error)
    return { count: 0 } // Return a default value if the request fails
  }
}

// Get recent notifications
export const getRecentNotifications = async (limit = 10) => {
  try {
    const response = await api.get(`notifications/recent/?limit=${limit}`)
    return response.data
  } catch (error) {
    console.error("Error in getRecentNotifications:", error)
    return [] // Return an empty array if the request fails
  }
}

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.post(`notifications/${notificationId}/read/`)
    return response.data
  } catch (error) {
    console.error("Error in markAsRead:", error)
    return { message: "Failed to mark notification as read" }
  }
}

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await api.post("notifications/mark-all-read/")
    return response.data
  } catch (error) {
    console.error("Error in markAllAsRead:", error)
    return { message: "Failed to mark all notifications as read" }
  }
}
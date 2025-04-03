import api from "./api"

// Get all notifications for the current user
export const getNotifications = async (limit = 20) => {
  try {
    const response = await api.get(`notifications/?limit=${limit}`)
    return response.data
  } catch (error) {
    console.error("Error fetching notifications:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Get recent notifications
export const getRecentNotifications = async (limit = 10) => {
  try {
    const response = await api.get(`notifications/recent/?limit=${limit}`)
    return response.data
  } catch (error) {
    console.error("Error fetching recent notifications:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Mark a notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.post(`notifications/${notificationId}/mark_as_read/`)
    return response.data
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await api.post("notifications/mark_all_as_read/")
    return response.data
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await api.get("notifications/unread_count/")
    return response.data.count
  } catch (error) {
    console.error("Error fetching unread count:", error)
    throw error.response ? error.response.data : error.message
  }
}


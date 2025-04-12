import api from "./api"

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await api.get("notifications/unread-count/")
    return response.data.count
  } catch (error) {
    console.error("Error in getUnreadCount:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Get notifications
export const getNotifications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams()

    // Add params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value)
    })

    const response = await api.get(`notifications/?${queryParams.toString()}`)
    return response.data
  } catch (error) {
    console.error("Error in getNotifications:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Mark a notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.post(`notifications/${notificationId}/read/`)
    return response.data
  } catch (error) {
    console.error("Error in markAsRead:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await api.post("notifications/mark-all-read/")
    return response.data
  } catch (error) {
    console.error("Error in markAllAsRead:", error)
    throw error.response ? error.response.data : error.message
  }
}

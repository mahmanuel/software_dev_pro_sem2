import api from "./api"

// Get all faculty members
export const getFacultyList = async () => {
  try {
    console.log("Fetching faculty list from API...")
    const response = await api.get("users/faculty/")
    console.log("Faculty list API response:", response)

    // Check if we have valid data
    if (response.data) {
      // Handle different response formats
      let facultyData = []

      if (Array.isArray(response.data)) {
        facultyData = response.data
      } else if (response.data.results && Array.isArray(response.data.results)) {
        facultyData = response.data.results
      } else {
        console.warn("Unexpected faculty list format:", response.data)
        return []
      }

      // Format faculty data consistently
      return facultyData.map((faculty) => ({
        id: faculty.id,
        email: faculty.email,
        name: faculty.name || `${faculty.first_name || ""} ${faculty.last_name || ""}`.trim() || faculty.email,
        department: faculty.department || "No Department",
      }))
    } else {
      console.warn("No data received from faculty API")
      return []
    }
  } catch (error) {
    console.error("Error in getFacultyList:", error)
    console.log("API error details:", error.response?.data || error.message)
    return []
  }
}

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`users/${userId}/`)
    return response.data
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await api.patch(`users/${userId}/`, userData)
    return response.data
  } catch (error) {
    console.error("Error in updateUserProfile:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Get analytics data
export const getAnalyticsData = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams()

    // Add params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value)
    })

    const response = await api.get(`analytics/dashboard/?${queryParams.toString()}`)
    return response.data
  } catch (error) {
    console.error("Error in getAnalyticsData:", error)
    throw error.response ? error.response.data : error.message
  }
}

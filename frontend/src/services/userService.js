import api from "./api"

/**
 * Get faculty list from the API
 * @returns {Promise<Array>} Array of faculty members with generated IDs
 */
export const getFacultyList = async () => {
  try {
    console.log("Fetching faculty list from API...")
    const response = await api.get("users/faculty/")
    console.log("Faculty list API response:", response)

    if (!response.data || !Array.isArray(response.data)) {
      console.error("Invalid faculty data format:", response.data)
      return []
    }

    // Process the faculty data to add stable IDs
    const processedData = response.data.map((faculty, index) => {
      // Create a stable ID based on name and department
      const firstName = (faculty.first_name || "").toLowerCase()
      const lastName = (faculty.last_name || "").toLowerCase()
      const dept = (faculty.department || "").toLowerCase()

      // Create a unique identifier for each faculty
      const uniqueId = `${firstName}-${lastName}-${dept}`.replace(/\s+/g, "-")

      return {
        // Use the unique ID we created
        id: uniqueId,
        // Use available data or provide defaults
        name: `${faculty.first_name || ""} ${faculty.last_name || ""}`.trim(),
        email: faculty.email || "",
        department: faculty.department || "Not specified",
        // Store original data for reference
        originalData: faculty,
      }
    })

    console.log("Processed faculty data:", processedData)
    return processedData
  } catch (error) {
    console.error("Error in getFacultyList:", error)
    return [] // Return empty array instead of throwing
  }
}

/**
 * Get user profile from the API
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get("users/profile/")
    return response.data
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    throw error.response ? error.response.data : error.message
  }
}

/**
 * Get analytics data from the API
 * @returns {Promise<Object>} Analytics data
 */
export const getAnalyticsData = async () => {
  try {
    const response = await api.get("analytics/dashboard/")
    return response.data
  } catch (error) {
    console.error("Error in getAnalyticsData:", error)
    throw error.response ? error.response.data : error.message
  }
}

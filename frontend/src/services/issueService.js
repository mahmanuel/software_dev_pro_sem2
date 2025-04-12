import api from "./api"

// Get all issues (with optional filters)
export const getAllIssues = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    // Add filters to query string
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value)
    })

    const response = await api.get(`issues/?${queryParams.toString()}`)
    return response.data
  } catch (error) {
    console.error("Error in getAllIssues:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Get issues submitted by the current user
export const getUserIssues = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    // Add filters to query string
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value)
    })

    const response = await api.get(`issues/my-issues/?${queryParams.toString()}`)
    return response.data
  } catch (error) {
    console.error("Error in getUserIssues:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Get issue details by ID
export const getIssueDetails = async (issueId) => {
  try {
    const response = await api.get(`issues/${issueId}/`)
    return response.data
  } catch (error) {
    console.error("Error in getIssueDetails:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Create a new issue
export const createIssue = async (issueData) => {
  try {
    const response = await api.post("issues/", issueData)
    return response.data
  } catch (error) {
    console.error("Error in createIssue:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Assign an issue to a faculty member
export const assignIssue = async (issueId, facultyId) => {
  try {
    console.log(`API call: Assigning issue ${issueId} to faculty ${facultyId}`)

    // Ensure we're sending the correct payload format
    const payload = { faculty_id: facultyId }
    console.log("Assignment payload:", payload)

    const response = await api.post(`issues/${issueId}/assign/`, payload)
    console.log("Assignment response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error in assignIssue:", error)
    // Provide more detailed error information
    const errorMessage = error.response?.data?.detail || error.message || "Unknown error"
    throw new Error(errorMessage)
  }
}

// Add a status update to an issue
export const addIssueStatus = async (issueId, statusData) => {
  try {
    const response = await api.post(`issues/${issueId}/status/`, statusData)
    return response.data
  } catch (error) {
    console.error("Error in addIssueStatus:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Add a comment to an issue
export const addComment = async (issueId, content) => {
  try {
    const response = await api.post(`issues/${issueId}/comments/`, { content })
    return response.data
  } catch (error) {
    console.error("Error in addComment:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Upload an attachment to an issue
export const uploadAttachment = async (issueId, file) => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await api.post(`issues/${issueId}/attachments/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Error in uploadAttachment:", error)
    throw error.response ? error.response.data : error.message
  }
}

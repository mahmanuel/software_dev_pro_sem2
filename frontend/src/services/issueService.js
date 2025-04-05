import api from "./api"

// Get all issues (filtered by user role)
export const getAllIssues = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    // Add filters to query params
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

// Get issues for current user
export const getUserIssues = async () => {
  try {
    const response = await api.get("issues/my-issues/")
    return response.data
  } catch (error) {
    console.error("Error in getUserIssues:", error)
    throw error.response ? error.response.data : error.message
  }
}

// Get a specific issue with details
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
    console.log("Creating issue with data:", issueData)
    const response = await api.post("issues/", issueData)
    console.log("Create issue response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error in createIssue:", error)
    if (error.response) {
      console.error("Error response data:", error.response.data)
      throw error.response.data
    }
    throw error.message
  }
}

// Update an issue
export const updateIssue = async (issueId, issueData) => {
  try {
    const response = await api.patch(`issues/${issueId}/`, issueData)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

// Delete an issue
export const deleteIssue = async (issueId) => {
  try {
    const response = await api.delete(`issues/${issueId}/`)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

// Assign an issue to a faculty member
export const assignIssue = async (issueId, facultyId) => {
  try {
    const response = await api.post(`issues/${issueId}/assign/`, { faculty_id: facultyId })
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

// Escalate an issue
export const escalateIssue = async (issueId, reason) => {
  try {
    const response = await api.post(`issues/${issueId}/escalate/`, { reason })
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

// Add a status update to an issue
export const addIssueStatus = async (issueId, statusData) => {
  try {
    const response = await api.post(`issues/${issueId}/statuses/`, statusData)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

// Get status history for an issue
export const getIssueStatuses = async (issueId) => {
  try {
    const response = await api.get(`issues/${issueId}/statuses/`)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

// Add a comment to an issue
export const addComment = async (issueId, content) => {
  try {
    const response = await api.post(`issues/${issueId}/comments/`, { content })
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

// Get comments for an issue
export const getComments = async (issueId) => {
  try {
    const response = await api.get(`issues/${issueId}/comments/`)
    return response.data
  } catch (error) {
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
    throw error.response ? error.response.data : error.message
  }
}

// Get attachments for an issue
export const getAttachments = async (issueId) => {
  try {
    const response = await api.get(`issues/${issueId}/attachments/`)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}


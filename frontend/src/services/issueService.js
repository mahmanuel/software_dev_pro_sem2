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

// Get issues assigned to the current user (faculty)
export const getUserIssues = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    // Add filters to query string
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value)
    })

    // Try the user-issues endpoint first
    try {
      const response = await api.get(`issues/user-issues/?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      // If that fails, try the get-user-issues endpoint
      if (error.response && error.response.status === 404) {
        console.log("Falling back to get-user-issues endpoint")
        const response = await api.get(`issues/get-user-issues/?${queryParams.toString()}`)
        return response.data
      }
      throw error
    }
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
    console.log("API Assignment Request:", { issueId, facultyId });
    
    // Handle unassignment
    if (facultyId === null) {
      const response = await api.post(`issues/${issueId}/assign/`, { 
        faculty_id: null 
      });
      return response.data;
    }
    
    // Validate faculty ID before sending
    if (typeof facultyId !== 'number' || isNaN(facultyId)) {
      throw new Error(`Invalid faculty ID: ${facultyId}`);
    }

    const response = await api.post(`issues/${issueId}/assign/`, { 
      faculty_id: facultyId 
    });
    return response.data;
    
  } catch (error) {
    console.error("API Assignment Error:", {
      status: error.response?.status,
      data: error.response?.data,
      issueId,
      facultyId
    });
    throw error;
  }
};

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

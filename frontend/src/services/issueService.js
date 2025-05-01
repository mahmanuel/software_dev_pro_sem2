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
 
     // Try both endpoints to ensure we get the data
     try {
       // First try the faculty_issues endpoint
       const response = await api.get(`issues/faculty_issues/?${queryParams.toString()}`)
       console.log("Faculty issues response:", response.data)
       return Array.isArray(response.data) ? response.data : response.data.results ? response.data.results : []
     } catch (firstError) {
       console.log("First endpoint failed, trying my-issues endpoint")
       // If that fails, try the my-issues endpoint
       const response = await api.get(`issues/my-issues/?${queryParams.toString()}`)
       console.log("My issues response:", response.data)
       return Array.isArray(response.data) ? response.data : response.data.results ? response.data.results : []
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
     console.log("API Assignment Request:", { issueId, facultyId })
 
     // Create the request payload
     let payload = {}
 
     if (facultyId === null || facultyId === "") {
       // Handle unassignment
       payload = { faculty_id: null }
     } else if (typeof facultyId === "string" && facultyId.includes("-")) {
       // This is our custom ID format (e.g., "mark-nsubuga-csc")
       // Extract the name parts from our custom ID
       const parts = facultyId.split("-")
 
       if (parts.length >= 2) {
         // Reconstruct the name from the ID parts
         const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
         const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
 
         // Send the faculty name to the backend
         payload = {
           faculty_name: `${firstName} ${lastName}`,
           department: parts.length >= 3 ? parts[2] : "",
         }
 
         console.log("Using faculty name for assignment:", payload)
       } else {
         // Fallback to sending the ID as is
         payload = { faculty_id: facultyId }
       }
     } else {
       // If it's not in our custom format, pass it through
       payload = { faculty_id: facultyId }
     }
 
     console.log("Assignment payload:", payload)
 
     // Send the request
     const response = await api.post(`issues/${issueId}/assign/`, payload)
     return response.data
   } catch (error) {
     console.error("API Assignment Error:", {
       status: error.response?.status,
       data: error.response?.data,
       issueId,
       facultyId,
     })
     throw error.response ? error.response.data : error
   }
 }
 
 // Resolve an issue
 export const resolveIssue = async (issueId) => {
   try {
     const response = await api.post(`issues/${issueId}/resolve/`)
     return response.data
   } catch (error) {
     console.error("Error in resolveIssue:", error)
     throw error.response ? error.response.data : error.message
   }
 }
 
 // Add a status update to an issue
 export const addIssueStatus = async (issueId, { status, notes }) => {
   try {
     console.log("Payload for addIssueStatus:", { status, notes })
 
     // For RESOLVED status, use the dedicated resolve endpoint
     if (status === "RESOLVED") {
       const response = await api.post(`issues/${issueId}/resolve/`, { notes })
       return response.data
     } else {
       // For other statuses, use the regular status endpoint
       const response = await api.post(`issues/${issueId}/status/`, { status, notes })
       return response.data
     }
   } catch (error) {
     console.error("Error in addIssueStatus:", error.response?.data || error.message)
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
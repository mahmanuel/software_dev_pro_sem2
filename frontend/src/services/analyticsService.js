import api from "./api"

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    return await api.get("/analytics/dashboard_stats/")
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    throw error
  }
}

// Get issue count by status
export const getIssueCountByStatus = async () => {
  try {
    return await api.get("/analytics/issue-count-by-status/")
  } catch (error) {
    console.error("Get issue count by status error:", error)
    throw error
  }
}

// Get issue count by category
export const getIssueCountByCategory = async () => {
  try {
    return await api.get("/analytics/issue-count-by-category/")
  } catch (error) {
    console.error("Get issue count by category error:", error)
    throw error
  }
}

// Get average resolution time
export const getAverageResolutionTime = async () => {
  try {
    return await api.get("/analytics/average-resolution-time/")
  } catch (error) {
    console.error("Get average resolution time error:", error)
    throw error
  }
}

// Get faculty performance metrics
export const getFacultyPerformanceMetrics = async () => {
  try {
    return await api.get("/analytics/faculty-performance/")
  } catch (error) {
    console.error("Get faculty performance metrics error:", error)
    throw error
  }
}

// Get issue trends over time
export const getIssueTrends = async (period = "month") => {
  try {
    return await api.get(`/analytics/issue-trends/?period=${period}`)
  } catch (error) {
    console.error("Get issue trends error:", error)
    throw error
  }
}

/**
 * Get audit logs with optional filtering
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} - Promise with the audit logs data
 */
// Function to fetch audit logs
export const getAuditLogs = async (params = {}) => {
  try {
    console.log("Fetching audit logs with params:", params)
    // Fix the endpoint path - change from "/api/auditlog/logs/" to "/api/audit/logs/"
    const response = await api.get("/auditlog/", { params })
    console.log("Audit logs response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    throw error
  }
}

/**
 * Get analytics data for audit logs
 * @returns {Promise} - Promise with the analytics data
 */
export const getAuditLogAnalytics = async () => {
  try {
    const response = await api.get("/analytics/audit-log-analytics/")
    return response.data
  } catch (error) {
    console.error("Error fetching audit log analytics:", error)
    throw error
  }
}
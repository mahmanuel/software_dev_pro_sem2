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

// Get audit logs
export const getAuditLogs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value)
      }
    })

    return await api.get(`/auditlog/?${queryParams.toString()}`)
  } catch (error) {
    console.error("Get audit logs error:", error)
    throw error
  }
}

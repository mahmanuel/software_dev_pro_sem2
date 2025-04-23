"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getAllIssues, assignIssue, addIssueStatus, addComment } from "../services/issueService"
import { getFacultyList, getAnalyticsData } from "../services/userService"
import { getAuditLogs } from "../services/analyticsService"
import { logout } from "../services/authService"
import NotificationBell from "./NotificationBell"
import AlertNotification from "./AlertNotification"
import { STATUS_LABELS, CATEGORY_LABELS, PRIORITY_LABELS } from "../constants/issueConstants"

function DashboardRegistrar({ setUser }) {
  const [issues, setIssues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
  })
  const [facultyList, setFacultyList] = useState([])
  const [isFacultyLoading, setIsFacultyLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [showAuditLog, setShowAuditLog] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [auditLogs, setAuditLogs] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [logFilters, setLogFilters] = useState({
    action: "",
    search: "",
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [commentData, setCommentData] = useState({
    issueId: null,
    content: "",
  })
  const [refreshInterval, setRefreshInterval] = useState(null)
  const navigate = useNavigate()

  // Use useCallback to memoize the fetchIssues function
  const fetchIssues = useCallback(async () => {
    setIsLoading(true)
    try {
      console.log("Fetching issues for registrar dashboard")
      // Remove empty filters
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ""))

      const data = await getAllIssues(activeFilters)
      console.log("Issues fetched:", data)

      // Check if the response is paginated and extract the results array
      const issuesArray = data.results ? data.results : Array.isArray(data) ? data : []
      setIssues(issuesArray)
      setError("")
    } catch (err) {
      console.error("Error fetching issues:", err)
      setError("Failed to load issues. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const fetchAuditLogs = async () => {
    setIsLoadingLogs(true)
    try {
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...logFilters,
      }

      const response = await getAuditLogs(queryParams)
      setAuditLogs(response.results || [])
      setPagination({
        ...pagination,
        total: response.count || 0,
      })
    } catch (err) {
      console.error("Error fetching audit logs:", err)
      setNotification({
        message: "Failed to load audit logs. Please try again.",
        type: "error",
      })
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const fetchAnalyticsData = async () => {
    setIsLoadingAnalytics(true)
    try {
      const data = await getAnalyticsData()
      setAnalyticsData(data)
    } catch (err) {
      console.error("Error fetching analytics data:", err)
      setNotification({
        message: "Failed to load analytics data. Please try again.",
        type: "error",
      })
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  const fetchFacultyList = useCallback(async () => {
    setIsFacultyLoading(true)
    try {
      console.log("Fetching faculty list...")
      const data = await getFacultyList()
      console.log("Faculty list fetched:", data)

      if (Array.isArray(data) && data.length > 0) {
        setFacultyList(data)
        console.log("Faculty list set:", data)
      } else {
        console.error("Unexpected faculty list format or empty list:", data)
        setNotification({
          message: "No faculty members found. Please ensure faculty members are registered in the system.",
          type: "warning",
        })
        setFacultyList([])
      }
    } catch (err) {
      console.error("Error fetching faculty list:", err)
      setNotification({
        message: "Failed to load faculty list. Please check the API connection.",
        type: "error",
      })
      setFacultyList([])
    } finally {
      setIsFacultyLoading(false)
    }
  }, [])

  // Setup auto-refresh for issues
  useEffect(() => {
    // Initial fetch
    fetchIssues()
    fetchFacultyList()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      console.log("Auto-refreshing issues...")
      fetchIssues()
    }, 30000) // 30 seconds

    setRefreshInterval(interval)

    // Clean up interval on component unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
      clearInterval(interval)
    }
  }, [fetchIssues, fetchFacultyList])

  // Fetch audit logs when showing audit log section or when filters/pagination change
  useEffect(() => {
    if (showAuditLog) {
      fetchAuditLogs()
    }
  }, [showAuditLog, pagination.current, logFilters])

  // Fetch analytics data when showing analytics section
  useEffect(() => {
    if (showAnalytics) {
      fetchAnalyticsData()
    }
  }, [showAnalytics])

  // Add a function to manually refresh the faculty list
  const refreshFacultyList = () => {
    fetchFacultyList()
    setNotification({
      message: "Refreshing faculty list...",
      type: "info",
    })
  }

  // Add a function to manually refresh the issues list
  const refreshIssues = () => {
    fetchIssues()
    setNotification({
      message: "Refreshing issues list...",
      type: "info",
    })
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogFilterChange = (e) => {
    const { name, value } = e.target
    setLogFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Update the handleAssignIssue function to fix the faculty ID parsing issue
  const handleAssignIssue = async (issueId, facultyId) => {
    try {
      console.log("Assignment attempt:", { issueId, facultyId });
  
      // Handle unassignment case
      if (facultyId === null) {
        console.log("Processing unassignment");
        await assignIssue(issueId, null); // Update your API to handle null
        setNotification({
          message: "Issue unassigned successfully",
          type: "success",
        });
        fetchIssues();
        return;
      }
  
      // Validate faculty ID
      if (typeof facultyId === "string" && /^\d+$/.test(facultyId)) {
        facultyId = Number(facultyId); // Convert to number if it's a valid numeric string
      }
  
      if (typeof facultyId !== "number" || isNaN(facultyId)) {
        throw new Error(`Invalid faculty ID: must be a number, got ${facultyId}`);
      }
  
      // Find faculty for confirmation message
      const faculty = facultyList.find((f) => f.id === facultyId);
      if (!faculty) {
        throw new Error("Selected faculty member not found");
      }
  
      await assignIssue(issueId, facultyId);
  
      setNotification({
        message: `Assigned to ${faculty.name}`,
        type: "success",
      });
      fetchIssues();
    } catch (err) {
      console.error("Assignment failed:", {
        error: err,
        issueId,
        facultyId,
        facultyListLength: facultyList.length,
      });
  
      setNotification({
        message: `Assignment failed: ${err.message}`,
        type: "error",
      });
    }
  };
  const handleStatusChange = async (issueId, newStatus) => {
    try {
      console.log(`Updating issue ${issueId} status to ${newStatus}`)
      await addIssueStatus(issueId, {
        status: newStatus,
        notes: `Status updated to ${STATUS_LABELS[newStatus] || newStatus}`,
      })

      setNotification({
        message: `Issue status updated to ${STATUS_LABELS[newStatus] || newStatus}`,
        type: "success",
      })

      fetchIssues() // Refresh the list
    } catch (err) {
      console.error("Error updating issue status:", err)
      setNotification({
        message: "Failed to update issue status. Please try again.",
        type: "error",
      })
    }
  }

  const handleCommentChange = (e, issueId) => {
    setCommentData({
      issueId,
      content: e.target.value,
    })
  }

  const handleCommentSubmit = async (e, issueId) => {
    e.preventDefault()
    if (!commentData.content.trim()) return

    try {
      await addComment(issueId, commentData.content)

      setNotification({
        message: "Comment posted successfully",
        type: "success",
      })

      // Clear the comment form
      setCommentData({
        issueId: null,
        content: "",
      })

      // Refresh issues to show the new comment
      fetchIssues()
    } catch (err) {
      console.error("Error posting comment:", err)
      setNotification({
        message: "Failed to post comment. Please try again.",
        type: "error",
      })
    }
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate("/")
  }

  const toggleAuditLog = () => {
    setShowAuditLog(!showAuditLog)
    setShowAnalytics(false)
  }

  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics)
    setShowAuditLog(false)
  }

  const handleSearchLogs = () => {
    setPagination({ ...pagination, current: 1 })
  }

  const handleResetLogFilters = () => {
    setLogFilters({
      action: "",
      search: "",
    })
    setPagination({ ...pagination, current: 1 })
  }

  const getActionColor = (action) => {
    const colors = {
      CREATE: "green",
      UPDATE: "blue",
      DELETE: "red",
      LOGIN: "purple",
      LOGOUT: "orange",
      ASSIGN: "cyan",
      STATUS_CHANGE: "geekblue",
      COMMENT: "magenta",
    }
    return colors[action] || "default"
  }

  const userInfo = JSON.parse(localStorage.getItem("user") || "{}")
  const isAdmin = userInfo.role === "ADMIN" || userInfo.role === "admin"

  return (
    <div className="dashboard registrar-dashboard">
      {notification && (
        <AlertNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="dashboard-header">
        <h1>{isAdmin ? "Admin" : "Registrar"} Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={refreshIssues} className="refresh-button">
            Refresh Issues
          </button>
          <NotificationBell />
          <button onClick={toggleAnalytics} className="analytics-button">
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </button>
          <button onClick={toggleAuditLog} className="audit-log-button">
            {showAuditLog ? "Hide Audit Log" : "Show Audit Log"}
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="user-info">
        <p>
          Welcome, {userInfo.first_name} {userInfo.last_name}
        </p>
        <p>Email: {userInfo.email}</p>
        <p>Role: {userInfo.role}</p>
      </div>

      {showAnalytics && (
        <div className="analytics-section">
          <h2>Analytics Dashboard</h2>
          {isLoadingAnalytics ? (
            <div className="loading">Loading analytics data...</div>
          ) : analyticsData ? (
            <div className="analytics-content">
              <div className="analytics-cards">
                <div className="analytics-card">
                  <h3>Total Issues</h3>
                  <div className="analytics-value">{analyticsData.total_issues || 0}</div>
                </div>
                <div className="analytics-card">
                  <h3>Open Issues</h3>
                  <div className="analytics-value">{analyticsData.open_issues || 0}</div>
                </div>
                <div className="analytics-card">
                  <h3>Resolved Issues</h3>
                  <div className="analytics-value">{analyticsData.resolved_issues || 0}</div>
                </div>
                <div className="analytics-card">
                  <h3>Average Resolution Time</h3>
                  <div className="analytics-value">{analyticsData.avg_resolution_time || "N/A"}</div>
                </div>
              </div>

              <div className="analytics-charts">
                <div className="analytics-chart">
                  <h3>Issues by Category</h3>
                  <div className="chart-placeholder">
                    {analyticsData.issues_by_category ? (
                      <ul className="chart-data-list">
                        {Object.entries(analyticsData.issues_by_category).map(([category, count]) => (
                          <li key={category}>
                            {CATEGORY_LABELS[category] || category}: {count}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No category data available</p>
                    )}
                  </div>
                </div>

                <div className="analytics-chart">
                  <h3>Issues by Status</h3>
                  <div className="chart-placeholder">
                    {analyticsData.issues_by_status ? (
                      <ul className="chart-data-list">
                        {Object.entries(analyticsData.issues_by_status).map(([status, count]) => (
                          <li key={status}>
                            {STATUS_LABELS[status] || status}: {count}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No status data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-analytics">No analytics data available.</div>
          )}
        </div>
      )}

      {showAuditLog && (
        <div className="audit-log-section">
          <h2>Audit Log</h2>

          <div className="filter-section">
            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="action-filter">Action:</label>
                <select id="action-filter" name="action" value={logFilters.action} onChange={handleLogFilterChange}>
                  <option value="">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                  <option value="ASSIGN">Assign</option>
                  <option value="STATUS_CHANGE">Status Change</option>
                  <option value="COMMENT">Comment</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="search-filter">Search:</label>
                <input
                  id="search-filter"
                  name="search"
                  type="text"
                  placeholder="Search details..."
                  value={logFilters.search}
                  onChange={handleLogFilterChange}
                />
              </div>

              <div className="filter-actions">
                <button onClick={handleSearchLogs} className="search-button">
                  Search
                </button>
                <button onClick={handleResetLogFilters} className="reset-button">
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="audit-log-table">
            {isLoadingLogs ? (
              <div className="loading">Loading audit logs...</div>
            ) : auditLogs.length === 0 ? (
              <div className="no-logs">No audit logs found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Object Type</th>
                    <th>Object</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>
                        {log.user_details
                          ? `${log.user_details.first_name} ${log.user_details.last_name} (${log.user_details.email})`
                          : "System"}
                      </td>
                      <td>
                        <span className={`action-badge ${getActionColor(log.action)}`}>{log.action}</span>
                      </td>
                      <td>{log.content_type_name}</td>
                      <td>{log.object_repr}</td>
                      <td>
                        {log.details ? (
                          <button
                            className="view-details-button"
                            onClick={() => alert(JSON.stringify(log.details, null, 2))}
                          >
                            View Details
                          </button>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="pagination">
            <button
              disabled={pagination.current === 1}
              onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
            >
              Previous
            </button>
            <span>
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="issues-section">
        <div className="issues-header">
          <h2>Student Academic Issues</h2>
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select id="status-filter" name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Statuses</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="category-filter">Category:</label>
              <select id="category-filter" name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="priority-filter">Priority:</label>
              <select id="priority-filter" name="priority" value={filters.priority} onChange={handleFilterChange}>
                <option value="">All Priorities</option>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Add a faculty list management section */}
        <div className="faculty-management-section">
          <div className="faculty-header">
            <h3>Faculty Management</h3>
            <button onClick={refreshFacultyList} className="refresh-button">
              Refresh Faculty List
            </button>
          </div>

          <div className="faculty-list-status">
            {isFacultyLoading ? (
              <p>Loading faculty list...</p>
            ) : facultyList.length > 0 ? (
              <p>Available faculty members: {facultyList.length}</p>
            ) : (
              <p className="error-message">
                No faculty members available. Please ensure faculty members are registered in the system.
              </p>
            )}
          </div>
        </div>

        <div className="issue-list">
          {isLoading ? (
            <div className="loading">Loading issues...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : issues.length === 0 ? (
            <div className="no-issues">No issues found. When students submit issues, they will appear here.</div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="issue-card">
                <div className="issue-header">
                  <h3>
                    <a href={`/issues/${issue.id}`}>{issue.title}</a>
                  </h3>
                  <div className="issue-meta">
                    <span className="issue-category">{CATEGORY_LABELS[issue.category] || issue.category}</span>
                    <span className="issue-priority">{PRIORITY_LABELS[issue.priority] || issue.priority}</span>
                    <span className="issue-status">
                      {STATUS_LABELS[issue.current_status] || issue.current_status || "SUBMITTED"}
                    </span>
                  </div>
                </div>

                <div className="issue-body">
                  <p>
                    {issue.description.length > 150 ? `${issue.description.substring(0, 150)}...` : issue.description}
                  </p>
                </div>

                <div className="issue-actions">
                  <div className="action-group">
                    <label>Status:</label>
                    <select
                      value={issue.current_status || "SUBMITTED"}
                      onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="action-group">
                    <label>Assign to:</label>
                    {isFacultyLoading ? (
                      <div className="loading-select">Loading faculty...</div>
                    ) : (
                      <select
                      value={issue.assigned_to?.id || ""}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        console.log("Selected faculty ID (raw):", selectedValue, typeof selectedValue); // Debugging log
                    
                        // Handle unassignment case
                        if (selectedValue === "") {
                          console.log("Unassigning issue");
                          handleAssignIssue(issue.id, null); // Explicit null for unassignment
                          return;
                        }
                    
                        // Convert to number and validate
                        const facultyId = Number(selectedValue);
                        if (isNaN(facultyId)) {
                          console.error("Invalid faculty ID conversion:", selectedValue);
                          setNotification({
                            message: "Please select a valid faculty member",
                            type: "error",
                          });
                          return;
                        }
                    
                        handleAssignIssue(issue.id, facultyId);
                      }}
                    >
                      <option value="">Unassigned</option>
                      {facultyList.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.name} ({faculty.department})
                        </option>
                      ))}
                    </select>
                    )}
                  </div>

                  <button className="view-details-button" onClick={() => navigate(`/issues/${issue.id}`)}>
                    View Details
                  </button>
                </div>

                <div className="comment-form-container">
                  <form onSubmit={(e) => handleCommentSubmit(e, issue.id)} className="comment-form">
                    <textarea
                      placeholder="Add a comment..."
                      value={commentData.issueId === issue.id ? commentData.content : ""}
                      onChange={(e) => handleCommentChange(e, issue.id)}
                      rows="2"
                      required
                    />
                    <button type="submit" className="post-comment-button">
                      Post Comment
                    </button>
                  </form>
                </div>

                <div className="issue-footer">
                  <div className="issue-submitter">Submitted by: {issue.submitted_by_details?.email || "Unknown"}</div>
                  <div className="issue-date">{new Date(issue.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardRegistrar

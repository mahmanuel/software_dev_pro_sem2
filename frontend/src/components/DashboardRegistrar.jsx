"use client";

<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getAllIssues, assignIssue, addIssueStatus, addComment } from "../services/issueService"
import { getFacultyList, getAnalyticsData } from "../services/userService"
import { getAuditLogs } from "../services/analyticsService"
import { logout } from "../services/authService"
import NotificationBell from "./NotificationBell"
import AlertNotification from "./AlertNotification"
import { STATUS_LABELS, CATEGORY_LABELS, PRIORITY_LABELS, STATUS_TYPES } from "../constants/issueConstants"

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
=======
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getAllIssues, assignIssue, addIssueStatus } from "../services/issueService";
import { logout } from "../services/authService";
import { fetchIssuesStart, fetchIssuesSuccess, fetchIssuesFailure } from "../slices/issuesSlice";
import NotificationBell from "./NotificationBell";
import LoadingSpinner from "./LoadingSpinner";
import { STATUS_LABELS, CATEGORY_LABELS, PRIORITY_LABELS } from "../constants/issueConstants";

function DashboardRegistrar({ setUser }) {
  const dispatch = useDispatch();
  const { list: issues, loading: isLoading, error } = useSelector((state) => state.issues);
  const [filters, setFilters] = useState({ status: "", category: "", priority: "" });
  const [facultyList, setFacultyList] = useState([]);
  const navigate = useNavigate();

  const fetchIssues = async () => {
    dispatch(fetchIssuesStart());
>>>>>>> 1bd985f633aa89c6c2965f3d23758b9c4e7f1ff3
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ""));
      const data = await getAllIssues(activeFilters);
      const issuesArray = data.results ? data.results : Array.isArray(data) ? data : [];
      dispatch(fetchIssuesSuccess(issuesArray));
    } catch (err) {
      console.error("Error fetching issues:", err);
      dispatch(fetchIssuesFailure("Failed to load issues."));
      toast.error("Failed to load issues. Please try again later.");
    }
<<<<<<< HEAD
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
=======
  };

  const fetchFacultyList = async () => {
    setFacultyList([
      { id: 1, email: "faculty1@example.com", name: "Faculty One" },
      { id: 2, email: "faculty2@example.com", name: "Faculty Two" },
      { id: 3, email: "faculty3@example.com", name: "Faculty Three" },
    ]);
  };
>>>>>>> 1bd985f633aa89c6c2965f3d23758b9c4e7f1ff3

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
<<<<<<< HEAD
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
=======
    fetchIssues();
    fetchFacultyList();
  }, [filters, dispatch]);
>>>>>>> 1bd985f633aa89c6c2965f3d23758b9c4e7f1ff3

  const handleLogFilterChange = (e) => {
    const { name, value } = e.target
    setLogFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAssignIssue = async (issueId, facultyId) => {
    try {
<<<<<<< HEAD
      // Don't proceed if facultyId is empty
      if (!facultyId) {
        console.log("No faculty selected, skipping assignment")
        return
      }

      console.log(`Assigning issue ${issueId} to faculty ${facultyId}`)

      // Convert facultyId to number if it's a string (select values are often strings)
      const facultyIdNum = Number.parseInt(facultyId, 10)

      await assignIssue(issueId, facultyIdNum)

      // Find the faculty name for the notification
      const faculty = facultyList.find((f) => f.id === facultyIdNum || f.id.toString() === facultyId.toString())
      const facultyName = faculty ? faculty.name || faculty.email : "selected lecturer"

      // Automatically update status to ASSIGNED
      await addIssueStatus(issueId, {
        status: STATUS_TYPES.ASSIGNED,
        notes: `Issue assigned to ${facultyName}`,
      })

      // Show success notification
      setNotification({
        message: `Issue successfully assigned to ${facultyName}`,
        type: "success",
      })

      fetchIssues() // Refresh the list
    } catch (err) {
      console.error("Error assigning issue:", err)

      // Check if this is the Django User model error
      if (err.message && err.message.includes("Backend configuration error: The User model")) {
        setNotification({
          message: `${err.message} Please provide the following instructions to your backend developer:
          
          In issues/views.py, replace:
          faculty = User.objects.get(id=faculty_id, role="FACULTY")
          
          With:
          from django.contrib.auth import get_user_model
          User = get_user_model()
          
          And then use:
          faculty = User.objects.get(id=faculty_id, role="FACULTY")`,
          type: "error",
        })
      } else if (err.message && err.message.includes("ContentType")) {
        setNotification({
          message: `${err.message} Please provide the following instructions to your backend developer:
          
          In issues/views.py, find the Notification.objects.create() call and update it:
          
          from django.contrib.contenttypes.models import ContentType
          
          # Get the ContentType for the Issue model
          issue_content_type = ContentType.objects.get_for_model(Issue)
          
          # Then in the Notification.objects.create() call:
          Notification.objects.create(
              user=faculty,
              content_type=issue_content_type,  # Use the ContentType instance
              object_id=issue.id,
              issue=issue,
              notification_type="ISSUE_ASSIGNED",
          )`,
          type: "error",
        })
      } else {
        setNotification({
          message: `Failed to assign issue: ${err.message || "Unknown error"}`,
          type: "error",
        })
      }
=======
      await assignIssue(issueId, facultyId);
      toast.success("Issue assigned successfully!");
      fetchIssues();
    } catch (err) {
      console.error("Error assigning issue:", err);
      toast.error("Failed to assign issue.");
>>>>>>> 1bd985f633aa89c6c2965f3d23758b9c4e7f1ff3
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
<<<<<<< HEAD
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
=======
      await addIssueStatus(issueId, { status: newStatus, notes: `Status updated to ${newStatus}` });
      toast.success("Status updated successfully!");
      fetchIssues();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
>>>>>>> 1bd985f633aa89c6c2965f3d23758b9c4e7f1ff3
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/");
  };

<<<<<<< HEAD
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
=======
  const handleNotificationClick = (notification) => {
    if (notification.content_type === "issues.issue" && notification.object_id) {
      navigate(`/issues/${notification.object_id}`);
    } else if (notification.viewAll) {
      alert("View all notifications clicked");
    }
  };
>>>>>>> 1bd985f633aa89c6c2965f3d23758b9c4e7f1ff3

  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = userInfo.role.toUpperCase() === "ADMIN";

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
<<<<<<< HEAD
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
=======
          <NotificationBell onNotificationClick={handleNotificationClick} />
          <button onClick={handleLogout} className="logout-button">Logout</button>
>>>>>>> 1bd985f633aa89c6c2965f3d23758b9c4e7f1ff3
        </div>
      </div>
      <div className="user-info">
        <p>Welcome, {userInfo.first_name} {userInfo.last_name}</p>
        <p>Email: {userInfo.email}</p>
        <p>Role: {userInfo.role}</p>
      </div>
<<<<<<< HEAD

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
=======
      <div className="issues-section">
        <h2>Student Issues</h2>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Status:</label>
            <select name="status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Category:</label>
            <select name="category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Priority:</label>
            <select name="priority" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
              <option value="">All Priorities</option>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : issues.length === 0 ? (
          <div className="no-issues">No issues found.</div>
        ) : (
          <div className="issue-list">
            {issues.map((issue) => (
>>>>>>> 1bd985f633aa89c6c2965f3d23758b9c4e7f1ff3
              <div key={issue.id} className="issue-card">
                <h3><a href={`/issues/${issue.id}`}>{issue.title}</a></h3>
                <p>{issue.description.substring(0, 150)}...</p>
                <div className="issue-actions">
                  <div className="action-group">
                    <label>Status:</label>
                    <select
                      value={issue.current_status || "SUBMITTED"}
                      onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
<<<<<<< HEAD

                  <div className="action-group">
                    <label>Assign to:</label>
                    {isFacultyLoading ? (
                      <div className="loading-select">Loading faculty...</div>
                    ) : (
=======
                  {isAdmin && (
                    <div className="action-group">
                      <label>Assign To:</label>
>>>>>>> 1bd985f633aa89c6c2965f3d23758b9c4e7f1ff3
                      <select
                        value={issue.assigned_to?.id || ""}
                        onChange={(e) => {
                          console.log("Selected faculty ID:", e.target.value)
                          handleAssignIssue(issue.id, e.target.value)
                        }}
                      >
                        <option value="">Unassigned</option>
<<<<<<< HEAD
                        {facultyList && facultyList.length > 0 ? (
                          facultyList.map((faculty) => (
                            <option key={faculty.id} value={faculty.id}>
                              {faculty.name} ({faculty.department})
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No faculty members available
                          </option>
                        )}
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
=======
                        {facultyList.map((faculty) => (
                          <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
>>>>>>> 1bd985f633aa89c6c2965f3d23758b9c4e7f1ff3
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default DashboardRegistrar
=======
export default DashboardRegistrar;
>>>>>>> 1bd985f633aa89c6c2965f3d23758b9c4e7f1ff3

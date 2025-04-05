"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllIssues, assignIssue, addIssueStatus } from "../services/issueService"
import { logout } from "../services/authService"
import NotificationBell from "./NotificationBell"
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
  const navigate = useNavigate()

  const fetchIssues = async () => {
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
  }

  // Mock function to fetch faculty list - in a real app, this would be an API call
  const fetchFacultyList = async () => {
    // This would be replaced with an actual API call
    setFacultyList([
      { id: 1, email: "faculty1@example.com", name: "Faculty One" },
      { id: 2, email: "faculty2@example.com", name: "Faculty Two" },
      { id: 3, email: "faculty3@example.com", name: "Faculty Three" },
    ])
  }

  useEffect(() => {
    fetchIssues()
    fetchFacultyList()
  }, [filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAssignIssue = async (issueId, facultyId) => {
    try {
      console.log(`Assigning issue ${issueId} to faculty ${facultyId}`)
      await assignIssue(issueId, facultyId)
      fetchIssues() // Refresh the list
    } catch (err) {
      console.error("Error assigning issue:", err)
      alert("Failed to assign issue. Please try again.")
    }
  }

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      console.log(`Updating issue ${issueId} status to ${newStatus}`)
      await addIssueStatus(issueId, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`,
      })
      fetchIssues() // Refresh the list
    } catch (err) {
      console.error("Error updating issue status:", err)
      alert("Failed to update issue status. Please try again.")
    }
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate("/")
  }

  const handleNotificationClick = (notification) => {
    // If it's a specific issue notification, navigate to that issue
    if (notification.content_type === "issues.issue" && notification.object_id) {
      navigate(`/issues/${notification.object_id}`)
    } else if (notification.viewAll) {
      // Navigate to notifications page (if you have one)
      alert("View all notifications clicked")
    }
  }

  const userInfo = JSON.parse(localStorage.getItem("user") || "{}")
  const isAdmin = userInfo.role === "ADMIN" || userInfo.role === "admin"

  return (
    <div className="dashboard registrar-dashboard">
      <div className="dashboard-header">
        <h1>{isAdmin ? "Admin" : "Faculty"} Dashboard</h1>
        <div className="dashboard-actions">
          <NotificationBell onNotificationClick={handleNotificationClick} />
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

      <div className="issues-section">
        <div className="issues-header">
          <h2>Student Academic Issues</h2>
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select id="status-filter" name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING_INFO">Pending Information</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="ESCALATED">Escalated</option>
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

                  {isAdmin && (
                    <div className="action-group">
                      <label>Assign to:</label>
                      <select
                        value={issue.assigned_to?.id || ""}
                        onChange={(e) => handleAssignIssue(issue.id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {facultyList.map((faculty) => (
                          <option key={faculty.id} value={faculty.id}>
                            {faculty.name} ({faculty.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button className="view-details-button" onClick={() => navigate(`/issues/${issue.id}`)}>
                    View Details
                  </button>
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


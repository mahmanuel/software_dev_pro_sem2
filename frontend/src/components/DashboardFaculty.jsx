"use client"
 
 import { useState, useEffect, useCallback } from "react"
 import { useNavigate } from "react-router-dom"
 import { addIssueStatus, addComment, getUserIssues } from "../services/issueService"
 import { logout } from "../services/authService"
 import NotificationBell from "./NotificationBell"
 import AlertNotification from "./AlertNotification"
 import { STATUS_LABELS, CATEGORY_LABELS, PRIORITY_LABELS } from "../constants/issueConstants"
 
 function DashboardFaculty({ setUser }) {
   const [issues, setIssues] = useState([])
   const [isLoading, setIsLoading] = useState(true)
   const [error, setError] = useState("")
   const [filters, setFilters] = useState({
     status: "",
     category: "",
     priority: "",
   })
   const [notification, setNotification] = useState(null)
   const [commentData, setCommentData] = useState({
     issueId: null,
     content: "",
   })
   const [refreshInterval, setRefreshInterval] = useState(null)
   const navigate = useNavigate()
 
   // Update the fetchIssues function to handle API errors better
   const fetchIssues = useCallback(async () => {
     setIsLoading(true)
     try {
       console.log("Fetching issues for faculty dashboard")
       const data = await getUserIssues(filters)
 
       // Log the response for debugging
       console.log("Issues fetched from faculty endpoint:", data)
 
       // Get the logged-in user info
       const userInfo = JSON.parse(localStorage.getItem("user") || "{}")
       console.log("Current user info:", userInfo)
 
       // Improved filtering logic to handle different ID formats
       const assignedIssues = data.filter((issue) => {
         // If the issue has no assigned_to field, it's not assigned to anyone
         if (!issue.assigned_to) return false
 
         console.log(`Comparing issue assigned_to:`, issue.assigned_to, `with user:`, userInfo)
 
         // Check if IDs match (handling both string and number types)
         const issueAssignedId = String(issue.assigned_to.id || issue.assigned_to)
         const userIdStr = String(userInfo.id)
 
         // Also check if the email matches as a fallback
         const emailMatches =
           issue.assigned_to.email === userInfo.email ||
           (issue.assigned_to_details && issue.assigned_to_details.email === userInfo.email)
 
         return issueAssignedId === userIdStr || emailMatches
       })
 
       console.log("Filtered issues for faculty:", assignedIssues)
       setIssues(assignedIssues)
       setError("")
     } catch (err) {
       console.error("Error fetching issues:", err)
       setError("Failed to load issues. Please try again later.")
     } finally {
       setIsLoading(false)
     }
   }, [filters])
 
   // Setup auto-refresh for issues
   useEffect(() => {
     // Initial fetch
     fetchIssues()
 
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
   }, [fetchIssues])
 
   const handleFilterChange = (e) => {
     const { name, value } = e.target
     setFilters((prev) => ({
       ...prev,
       [name]: value,
     }))
   }
   const handleStatusChange = async (issueId, newStatus) => {
     try {
       console.log(`Updating issue ${issueId} status to ${newStatus}`)
 
       // Show a confirmation dialog for resolving issues
       if (newStatus === "RESOLVED") {
         const confirmed = window.confirm("Are you sure you want to mark this issue as resolved?")
         if (!confirmed) {
           return
         }
       }
 
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
 
       // Provide a more specific error message
       let errorMessage = "Failed to update issue status. Please try again."
       if (typeof err === "object" && err.issue) {
         errorMessage = Array.isArray(err.issue) ? err.issue.join(", ") : err.issue
       }
 
       setNotification({
         message: errorMessage,
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
 
   // Add a function to manually refresh the issues list
   const refreshIssues = () => {
     fetchIssues()
     setNotification({
       message: "Refreshing issues list...",
       type: "info",
     })
   }
 
   const userInfo = JSON.parse(localStorage.getItem("user") || "{}")
 
   return (
     <div className="dashboard faculty-dashboard">
       {notification && (
         <AlertNotification
           message={notification.message}
           type={notification.type}
           onClose={() => setNotification(null)}
         />
       )}
 
       <div className="dashboard-header">
         <h1>Faculty Dashboard</h1>
         <div className="dashboard-actions">
           <button onClick={refreshIssues} className="refresh-button">
             Refresh Issues
           </button>
           <NotificationBell />
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
         <p>Department: {userInfo.department || "Not specified"}</p>
       </div>
 
       <div className="issues-section">
         <div className="issues-header">
           <h2>Assigned Academic Issues</h2>
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
 
         <div className="issue-list">
           {isLoading ? (
             <div className="loading">Loading issues...</div>
           ) : error ? (
             <div className="error-message">{error}</div>
           ) : issues.length === 0 ? (
             <div className="no-issues">No issues assigned to you yet.</div>
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
 
 export default DashboardFaculty
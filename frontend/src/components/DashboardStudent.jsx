"use client"
 
 import { useState, useEffect } from "react"
 import { useNavigate } from "react-router-dom"
 import { getAllIssues, getUserIssues } from "../services/issueService"
 import { logout } from "../services/authService"
 import IssueForm from "./IssueForm"
 import IssueList from "./IssueList"
 import NotificationBell from "./NotificationBell"
 
 function DashboardStudent({ setUser }) {
   const [issues, setIssues] = useState([])
   const [isLoading, setIsLoading] = useState(true)
   const [error, setError] = useState("")
   const [filter, setFilter] = useState("")
   const navigate = useNavigate()
 
   const fetchIssues = async () => {
     setIsLoading(true)
     try {
       console.log("Fetching issues for student dashboard")
 
       // Try to get user-specific issues first
       try {
         const userIssues = await getUserIssues()
         console.log("User issues fetched:", userIssues)
 
         // Check if the response is paginated and extract the results array
         const issuesArray = userIssues.results ? userIssues.results : Array.isArray(userIssues) ? userIssues : []
 
         setIssues(issuesArray)
       } catch (userIssuesError) {
         console.error("Error fetching user issues, falling back to all issues:", userIssuesError)
 
         // Fallback to all issues with filter
         const data = await getAllIssues({ status: filter })
         console.log("All issues fetched:", data)
 
         // Check if the response is paginated and extract the results array
         const issuesArray = data.results ? data.results : Array.isArray(data) ? data : []
 
         setIssues(issuesArray)
       }
 
       setError("")
     } catch (err) {
       console.error("Error fetching issues:", err)
       setError("Failed to load issues. Please try again later.")
     } finally {
       setIsLoading(false)
     }
   }
 
   useEffect(() => {
     fetchIssues()
   }, [filter])
 
   const handleIssueSubmit = (newIssue) => {
     console.log("New issue submitted, refreshing list")
     fetchIssues()
     // Show success message is handled in the IssueForm component
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
 
   return (
     <div className="dashboard student-dashboard">
       <div className="dashboard-header">
         <h1>Student Dashboard</h1>
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
       </div>
 
       <div className="issue-form-section">
         <div className="form-header">
           <h2>Submit Academic Issue</h2>
         </div>
         <IssueForm onIssueSubmit={handleIssueSubmit} />
       </div>
 
       <div className="issues-section">
         <div className="issues-header">
           <h2>My Issues</h2>
           <div className="filter-controls">
             <label htmlFor="status-filter">Filter by Status:</label>
             <select id="status-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
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
         </div>
 
         <IssueList issues={issues} isLoading={isLoading} error={error} />
       </div>
     </div>
   )
 }
 
 export default DashboardStudent
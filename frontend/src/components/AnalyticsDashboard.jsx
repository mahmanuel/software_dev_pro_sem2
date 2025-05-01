"use client"
 
 import { useState, useEffect } from "react"
 import { useNavigate } from "react-router-dom"
 import api from "../services/api"
 import "./styles/AnalyticsDashboard.css"
 
 function AnalyticsDashboard() {
   const [dashboardStats, setDashboardStats] = useState(null)
   const [issueTrends, setIssueTrends] = useState([])
   const [userActivity, setUserActivity] = useState([])
   const [isLoading, setIsLoading] = useState(true)
   const [error, setError] = useState("")
   const [timeRange, setTimeRange] = useState(30) // Default to 30 days
   const navigate = useNavigate()

   useEffect(() => {
    fetchDashboardData()
  }, [timeRange])
  
  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch dashboard stats (change URL to match Django)
      const statsResponse = await api.get("/analytics/")
      setDashboardStats(statsResponse.data)
  
      // Fetch issue trends (change URL to match Django)
      const trendsResponse = await api.get(`/analytics/analytics/issue_trends/?days=${timeRange}`)
      setIssueTrends(trendsResponse.data)
  
      // Fetch user activity (change URL to match Django)
      const activityResponse = await api.get(`/analytics/analytics/user_activity/?days=${timeRange}`)
      setUserActivity(activityResponse.data)
  
      setError("")
    } catch (err) {
      console.error("Error fetching analytics data:", err)
      setError("Failed to load analytics data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const goBack = () => {
    navigate(-1); // This will take the user back to the previous page
  }
 
   if (isLoading) {
     return <div className="loading">Loading analytics data...</div>
   }
 
   if (error) {
     return <div className="error-message">{error}</div>
   }
 
   return (
     <div className="analytics-dashboard">
       <div className="dashboard-header">
         <h1>Analytics Dashboard</h1>
         <button onClick={goBack} className="back-button">
          Back to Dashboard
        </button>
         <div className="time-range-selector">
           <label htmlFor="time-range">Time Range:</label>
           <select id="time-range" value={timeRange} onChange={(e) => setTimeRange(Number.parseInt(e.target.value))}>
             <option value="7">Last 7 Days</option>
             <option value="30">Last 30 Days</option>
             <option value="90">Last 90 Days</option>
             <option value="180">Last 6 Months</option>
           </select>
         </div>
       </div>
 
       {dashboardStats && (
         <div className="stats-overview">
           <div className="stat-card">
             <h3>Total Issues</h3>
             <div className="stat-value">{dashboardStats.total_issues}</div>
           </div>
           <div className="stat-card">
             <h3>New Issues Today</h3>
             <div className="stat-value">{dashboardStats.new_issues_today}</div>
           </div>
           <div className="stat-card">
             <h3>Resolved Today</h3>
             <div className="stat-value">{dashboardStats.resolved_today}</div>
           </div>
           <div className="stat-card">
             <h3>Active Users Today</h3>
             <div className="stat-value">{dashboardStats.active_users_today}</div>
           </div>
         </div>
       )}
 
       <div className="analytics-section">
         <h2>Issues by Status</h2>
         <div className="chart-container">
           {dashboardStats && dashboardStats.issues_by_status && (
             <div className="status-bars">
               {Object.entries(dashboardStats.issues_by_status).map(([status, count]) => (
                 <div className="status-bar-item" key={status}>
                   <div className="status-label">{status}</div>
                   <div className="status-bar-container">
                     <div
                       className="status-bar"
                       style={{
                         width: `${(count / dashboardStats.total_issues) * 100}%`,
                         backgroundColor: getStatusColor(status),
                       }}
                     ></div>
                   </div>
                   <div className="status-count">{count}</div>
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>
 
       <div className="analytics-section">
         <h2>Issues by Category</h2>
         <div className="chart-container">
           {dashboardStats && dashboardStats.issues_by_category && (
             <div className="category-chart">
               {Object.entries(dashboardStats.issues_by_category).map(([category, count]) => (
                 <div className="category-item" key={category}>
                   <div className="category-label">{category}</div>
                   <div className="category-value">{count}</div>
                   <div className="category-bar-container">
                     <div
                       className="category-bar"
                       style={{
                         width: `${(count / dashboardStats.total_issues) * 100}%`,
                       }}
                     ></div>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>
 
       <div className="analytics-section">
         <h2>Issue Trends</h2>
         <div className="chart-container">
           {issueTrends.length > 0 && (
             <div className="trend-chart">
               <div className="trend-legend">
                 <div className="legend-item">
                   <div className="legend-color" style={{ backgroundColor: "#4a00e0" }}></div>
                   <div className="legend-label">New Issues</div>
                 </div>
                 <div className="legend-item">
                   <div className="legend-color" style={{ backgroundColor: "#2ecc71" }}></div>
                   <div className="legend-label">Resolved Issues</div>
                 </div>
               </div>
               <div className="trend-chart-container">
                 {issueTrends.map((day) => (
                   <div className="trend-day" key={day.date}>
                     <div className="trend-date">{formatDate(day.date)}</div>
                     <div className="trend-bars">
                       <div
                         className="trend-bar new-issues"
                         style={{
                           height: `${getBarHeight(day.new_issues, getMaxValue(issueTrends, "new_issues"))}%`,
                         }}
                       >
                         <span className="trend-value">{day.new_issues}</span>
                       </div>
                       <div
                         className="trend-bar resolved-issues"
                         style={{
                           height: `${getBarHeight(day.resolved_issues, getMaxValue(issueTrends, "resolved_issues"))}%`,
                         }}
                       >
                         <span className="trend-value">{day.resolved_issues}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>
       </div>
 
       <div className="analytics-section">
         <h2>User Activity</h2>
         <div className="chart-container">
           {userActivity.length > 0 && (
             <div className="user-activity-chart">
               <div className="activity-legend">
                 <div className="legend-item">
                   <div className="legend-color" style={{ backgroundColor: "#3498db" }}></div>
                   <div className="legend-label">Active Users</div>
                 </div>
                 <div className="legend-item">
                   <div className="legend-color" style={{ backgroundColor: "#e74c3c" }}></div>
                   <div className="legend-label">Logins</div>
                 </div>
               </div>
               <div className="activity-chart-container">
                 {userActivity.map((day) => (
                   <div className="activity-day" key={day.date}>
                     <div className="activity-date">{formatDate(day.date)}</div>
                     <div className="activity-bars">
                       <div
                         className="activity-bar active-users"
                         style={{
                           height: `${getBarHeight(day.active_users, getMaxValue(userActivity, "active_users"))}%`,
                         }}
                       >
                         <span className="activity-value">{day.active_users}</span>
                       </div>
                       <div
                         className="activity-bar logins"
                         style={{
                           height: `${getBarHeight(day.logins, getMaxValue(userActivity, "logins"))}%`,
                         }}
                       >
                         <span className="activity-value">{day.logins}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>
       </div>
 
       <div className="analytics-section">
         <h2>Recent Activity</h2>
         <div className="recent-activity">
           {dashboardStats && dashboardStats.recent_activity && (
             <ul className="activity-list">
               {dashboardStats.recent_activity.map((activity, index) => (
                 <li key={index} className="activity-item">
                   <div className="activity-user">{activity.user_email}</div>
                   <div className="activity-type">{activity.activity_type}</div>
                   <div className="activity-time">{formatDateTime(activity.timestamp)}</div>
                   {activity.related_issue && (
                     <div className="activity-issue">
                       <a href={`/issues/${activity.related_issue}`}>Issue #{activity.related_issue}</a>
                     </div>
                   )}
                 </li>
               ))}
             </ul>
           )}
         </div>
       </div>
     </div>
   )
 }
 
 // Helper functions
 function getStatusColor(status) {
   const colors = {
     SUBMITTED: "#3498db",
     ASSIGNED: "#9b59b6",
     IN_PROGRESS: "#f39c12",
     PENDING_INFO: "#e67e22",
     RESOLVED: "#2ecc71",
     CLOSED: "#27ae60",
     ESCALATED: "#e74c3c",
   }
   return colors[status] || "#777"
 }
 
 function formatDate(dateString) {
   const date = new Date(dateString)
   return date.toLocaleDateString()
 }
 
 function formatDateTime(dateTimeString) {
   const date = new Date(dateTimeString)
   return date.toLocaleString()
 }
 
 function getMaxValue(data, key) {
   return Math.max(...data.map((item) => item[key]))
 }
 
 function getBarHeight(value, maxValue) {
   if (maxValue === 0) return 0
   return (value / maxValue) * 100
 }
 
 export default AnalyticsDashboard
 
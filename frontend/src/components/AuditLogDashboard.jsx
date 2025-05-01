"use client"
 
 import { useState, useEffect } from "react"
 import { useNavigate } from "react-router-dom"
 import { getAuditLogs } from "../services/analyticsService"
 import './styles/AuditLogDashboard.css'
 
 function AuditLogDashboard() {
   const [logs, setLogs] = useState([])
   const [isLoading, setIsLoading] = useState(true)
   const [error, setError] = useState("")
   const [pagination, setPagination] = useState({
     current: 1,
     pageSize: 10,
     total: 0,
   })
   const [filters, setFilters] = useState({
     action: "",
     dateRange: null,
     search: "",
     user: "",
   })
   const navigate = useNavigate()
 
   useEffect(() => {
     // Check if user is authorized
     const userInfo = JSON.parse(localStorage.getItem("user") || "{}")
     const userRole = userInfo.role?.toUpperCase() || ""
 
     if (userRole !== "ADMIN" && userRole !== "REGISTRAR") {
       setError("You do not have permission to access this page")
       return
     }
 
     fetchAuditLogs()
   }, [pagination.current, pagination.pageSize])
 
   const fetchAuditLogs = async () => {
     try {
       setIsLoading(true);
   
       const queryParams = {
         page: pagination.current,
         page_size: pagination.pageSize, // Ensure this matches the backend's expected parameter
       };
   
       if (filters.action) {
         queryParams.action = filters.action;
       }
   
       if (filters.search) {
         queryParams.search = filters.search;
       }
   
       if (filters.user) {
         queryParams.user = filters.user;
       }
   
       console.log("Query Params:", queryParams); // Debugging
   
       const response = await getAuditLogs(queryParams);
   
       console.log("Response:", response); // Debugging
   
       setLogs(response.results || []);
       setPagination({
         ...pagination,
         total: response.count || 0,
       });
   
       setError("");
     } catch (err) {
       console.error("Error fetching audit logs:", err);
       setError(err.response?.data?.detail || "Failed to load audit logs. Please try again later.");
     } finally {
       setIsLoading(false);
     }
   };
 
   const handleTableChange = (pagination) => {
     setPagination({
       ...pagination,
       current: pagination.current,
       pageSize: pagination.pageSize,
     })
   }
 
   const handleSearch = () => {
     setPagination({ ...pagination, current: 1 })
     fetchAuditLogs()
   }
 
   const handleReset = () => {
     setFilters({
       action: "",
       dateRange: null,
       search: "",
       user: "",
     })
     setPagination({ ...pagination, current: 1 })
     fetchAuditLogs()
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
 
   return (
     <div className="audit-log-dashboard">
       <div className="dashboard-header">
         <h1>Audit Log Dashboard</h1>
         <button onClick={() => navigate("/registrar")} className="back-button">
           Back to Dashboard
         </button>
       </div>
 
       <div className="filter-section">
         <div className="filter-controls">
           <div className="filter-group">
             <label htmlFor="action-filter">Action:</label>
             <select
               id="action-filter"
               value={filters.action}
               onChange={(e) => setFilters({ ...filters, action: e.target.value })}
             >
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
               type="text"
               placeholder="Search details..."
               value={filters.search}
               onChange={(e) => setFilters({ ...filters, search: e.target.value })}
             />
           </div>
 
           <div className="filter-actions">
             <button onClick={handleSearch} className="search-button">
               Search
             </button>
             <button onClick={handleReset} className="reset-button">
               Reset
             </button>
           </div>
         </div>
       </div>
 
       <div className="audit-log-table">
         {isLoading ? (
           <div className="loading">Loading audit logs...</div>
         ) : error ? (
           <div className="error-message">{error}</div>
         ) : logs.length === 0 ? (
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
                 <th>IP Address</th>
                 <th>Details</th>
               </tr>
             </thead>
             <tbody>
               {logs.map((log) => (
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
                   <td>{log.ip_address}</td>
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
   )
 }
 
 export default AuditLogDashboard
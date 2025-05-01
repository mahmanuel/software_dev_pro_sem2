"use client"
 
 import { useState, useEffect } from "react"
 import { getUnreadCount, markAllAsRead, getRecentNotifications } from "../services/notificationService"
 
 function NotificationBell() {
   const [unreadCount, setUnreadCount] = useState(0)
   const [showDropdown, setShowDropdown] = useState(false)
   const [notifications, setNotifications] = useState([])
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState(null)
 
   // Fetch unread count on component mount and periodically
   useEffect(() => {
     fetchUnreadCount()
 
     // Set up polling for notifications
     const interval = setInterval(fetchUnreadCount, 30000) // every 30 seconds
 
     return () => clearInterval(interval)
   }, [])
 
   const fetchUnreadCount = async () => {
     try {
       const data = await getUnreadCount()
       setUnreadCount(data.count || 0)
       setError(null)
     } catch (err) {
       console.error("Error fetching unread count:", err)
       // Don't set error state to avoid UI disruption for this non-critical feature
     }
   }
 
   const fetchNotifications = async () => {
     if (showDropdown) {
       setIsLoading(true)
       try {
         const data = await getRecentNotifications(5)
         setNotifications(Array.isArray(data) ? data : [])
         setError(null)
       } catch (err) {
         console.error("Error fetching notifications:", err)
         setNotifications([])
         // Don't set error state to avoid UI disruption
       } finally {
         setIsLoading(false)
       }
     }
   }
 
   // Fetch notifications when dropdown is opened
   useEffect(() => {
     fetchNotifications()
   }, [showDropdown])
 
   const handleToggleDropdown = () => {
     setShowDropdown(!showDropdown)
   }
 
   const handleMarkAllAsRead = async () => {
     try {
       await markAllAsRead()
       setUnreadCount(0)
       // Update the notifications to show they're read
       setNotifications(notifications.map((notif) => ({ ...notif, is_read: true })))
     } catch (err) {
       console.error("Error marking all as read:", err)
       // Don't set error state to avoid UI disruption
     }
   }
 
   return (
     <div className="notification-bell-container">
       <button
         className="notification-bell-button"
         onClick={handleToggleDropdown}
         aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
       >
         <span className="bell-icon">🔔</span>
         {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
       </button>
 
       {showDropdown && (
         <div className="notification-dropdown">
           <div className="notification-header">
             <h3>Notifications</h3>
             {unreadCount > 0 && (
               <button className="mark-all-read-button" onClick={handleMarkAllAsRead}>
                 Mark all as read
               </button>
             )}
           </div>
 
           <div className="notification-list">
             {isLoading ? (
               <div className="notification-loading">Loading...</div>
             ) : notifications.length > 0 ? (
               notifications.map((notification) => (
                 <div key={notification.id} className={`notification-item ${!notification.is_read ? "unread" : ""}`}>
                   <div className="notification-content">{notification.message}</div>
                   <div className="notification-time">{new Date(notification.created_at).toLocaleString()}</div>
                 </div>
               ))
             ) : (
               <div className="no-notifications">No notifications available</div>
             )}
           </div>
         </div>
       )}
     </div>
   )
 }
 
 export default NotificationBell
"use client"

import { useState, useEffect, useRef } from "react"
import { getUnreadCount, markAllAsRead } from "../services/notificationService"
import { NotificationSocket } from "../services/websocketService"

function NotificationBell({ onNotificationClick }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [wsConnected, setWsConnected] = useState(false)
  const notificationSocketRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount()
        setUnreadCount(count)
      } catch (error) {
        console.error("Error fetching unread count:", error)
      }
    }

    fetchUnreadCount()

    // Set up WebSocket connection for real-time notifications
    const token = localStorage.getItem("token")
    if (token) {
      const handleNotificationMessage = (data) => {
        if (data.type === "unread_count") {
          setUnreadCount(data.count)
        } else if (data.type === "notification_message") {
          // Add new notification to the list
          setNotifications((prev) => [data.notification, ...prev].slice(0, 5))
          // Update unread count
          setUnreadCount((prev) => prev + 1)
        }
      }

      const handleWsOpen = () => {
        setWsConnected(true)
      }

      try {
        notificationSocketRef.current = new NotificationSocket(token, handleNotificationMessage, handleWsOpen)
        notificationSocketRef.current.connect()
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error)
      }
    }

    // Cleanup WebSocket connection on unmount
    return () => {
      if (notificationSocketRef.current) {
        notificationSocketRef.current.disconnect()
      }
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleBellClick = () => {
    setShowDropdown(!showDropdown)
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setUnreadCount(0)

      // Also send WebSocket message to mark all as read
      if (notificationSocketRef.current && wsConnected) {
        notificationSocketRef.current.markAllAsRead()
      }

      // Update notifications list to mark all as read
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const handleNotificationClick = (notification) => {
    // Mark as read via WebSocket
    if (notificationSocketRef.current && wsConnected && !notification.read) {
      notificationSocketRef.current.markAsRead(notification.id)
    }

    // Call the parent callback
    if (onNotificationClick) {
      onNotificationClick(notification)
    }

    setShowDropdown(false)
  }

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <div className="notification-bell" onClick={handleBellClick}>
        <i className="bell-icon">🔔</i>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`notification-item ${notification.read ? "" : "unread"}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">{new Date(notification.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <p>No notifications</p>
              </div>
            )}
          </div>

          <div className="notification-footer">
            <button onClick={() => onNotificationClick({ viewAll: true })}>View all notifications</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell


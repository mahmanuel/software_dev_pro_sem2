"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getUnreadCount, markAllAsRead } from "../services/notificationService";
import { NotificationSocket } from "../services/websocketService";
import { setNotifications, addNotification, markAsRead, markAllAsRead as reduxMarkAll } from "../slices/notificationsSlice";

function NotificationBell({ onNotificationClick }) {
  const dispatch = useDispatch();
  const { list: notifications, unreadCount } = useSelector((state) => state.notifications);
  const [showDropdown, setShowDropdown] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const notificationSocketRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        dispatch(setNotifications([])); // Initial empty list, update if you fetch full list
        dispatch({ type: "notifications/setUnreadCount", payload: count }); // Custom action if needed
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();

    const token = localStorage.getItem("token");
    if (token) {
      const handleNotificationMessage = (data) => {
        if (data.type === "unread_count") {
          dispatch({ type: "notifications/setUnreadCount", payload: data.count });
        } else if (data.type === "notification_message") {
          dispatch(addNotification(data.notification));
          toast.info(data.notification.message);
        }
      };

      const handleWsOpen = () => setWsConnected(true);

      try {
        notificationSocketRef.current = new NotificationSocket(token, handleNotificationMessage, handleWsOpen);
        notificationSocketRef.current.connect();
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
      }
    }

    return () => {
      if (notificationSocketRef.current) notificationSocketRef.current.disconnect();
    };
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      dispatch(reduxMarkAll());
      if (notificationSocketRef.current && wsConnected) notificationSocketRef.current.markAllAsRead();
      toast.success("All notifications marked as read!");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read.");
    }
  };

  const handleNotificationClick = (notification) => {
    if (notificationSocketRef.current && wsConnected && !notification.read) {
      notificationSocketRef.current.markAsRead(notification.id);
      dispatch(markAsRead(notification.id));
    }
    if (onNotificationClick) onNotificationClick(notification);
    setShowDropdown(false);
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      {/* Your existing JSX */}
    </div>
  );
}

export default NotificationBell;
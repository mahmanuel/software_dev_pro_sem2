import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getUnreadCount, markAllAsRead } from "../services/notificationService";
import { NotificationSocket } from "../services/websocketService";
import { setNotifications, addNotification, markAsRead, markAllAsRead as reduxMarkAll } from "../slices/notificationsSlice";
import { BellIcon } from "@heroicons/react/24/outline"; // Added for the bell icon

function NotificationBell({ onNotificationClick }) {
  const dispatch = useDispatch();
  const { list: notifications, unreadCount } = useSelector((state) => state.notifications);
  const [showDropdown, setShowDropdown] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added for loading state
  const notificationSocketRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        setIsLoading(true); // Start loading
        const count = await getUnreadCount();
        dispatch(setNotifications([])); // Initial empty list
        dispatch({ type: "notifications/setUnreadCount", payload: count });
      } catch (error) {
        console.error("Error fetching unread count:", error);
        toast.error("Failed to load notifications.");
      } finally {
        setIsLoading(false); // Stop loading
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
          toast.info(data.notification.message, {
            position: "top-right", // Improved toast positioning
            autoClose: 3000,
          });
        }
      };

      const handleWsOpen = () => {
        setWsConnected(true);
        toast.success("Connected to notifications!", { autoClose: 2000 }); // Feedback for WebSocket connection
      };

      const handleWsError = (error) => {
        console.error("WebSocket error:", error);
        setWsConnected(false);
        toast.error("Notification service unavailable.", { autoClose: 3000 });
      };

      try {
        notificationSocketRef.current = new NotificationSocket(token, handleNotificationMessage, handleWsOpen, handleWsError);
        notificationSocketRef.current.connect();
      } catch (error) {
        handleWsError(error);
      }
    } else {
      toast.warn("No token found. Please log in to receive notifications.", { autoClose: 3000 });
    }

    return () => {
      if (notificationSocketRef.current) notificationSocketRef.current.disconnect();
    };
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      dispatch(reduxMarkAll());
      if (notificationSocketRef.current && wsConnected) {
        notificationSocketRef.current.markAllAsRead();
      }
      toast.success("All notifications marked as read!", { autoClose: 2000 });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read.", { autoClose: 3000 });
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
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Unread Badge */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {isLoading ? (
          <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-gray-300 animate-pulse" />
        ) : unreadCount > 0 ? (
          <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="p-4 text-gray-500">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-gray-500">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 flex items-start space-x-3 ${
                    notification.read ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="h-3 w-3 rounded-full bg-blue-500 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;

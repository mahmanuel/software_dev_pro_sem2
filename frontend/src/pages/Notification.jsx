import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("ws://127.0.0.1:8000/ws/notifications/");

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on("message", (data) => {
      setNotifications((prev) => [...prev, data.message]);
    });
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.map((note, index) => (
        <p key={index}>{note}</p>
      ))}
    </div>
  );
};

export default Notifications;

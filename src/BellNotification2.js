// src/components/notifications/BellNotification.jsx
import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import bellAnimation from "./assets/lottie/Bell-Alert.json";

const BellNotification2 = ({
  message = "New notification", // Text to display
  type = "message", // "message", "group", "join", "friend"
  duration = 4000, // Auto-hide after 4 seconds
  onClose,
  show = false,
  showIcon = true, // Control whether to show icon
  iconSize = 100, // Size of the Lottie animation
  textPosition = "below", // 'below' or 'right'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Simple type configuration for icons
  const notificationIcons = {
    message: "💬",
    group: "👥",
    join: "🎉",
    friend: "👋",
  };

  // Show notification
  useEffect(() => {
    if (show) {
      setIsVisible(true);

      // Auto-hide after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  // Get icon based on type
  const icon = notificationIcons[type] || notificationIcons.message;

  // Layout for text below the icon
  if (textPosition === "below") {
    return (
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "15px 25px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          minWidth: "200px",
          textAlign: "center",
        }}
      >
        {/* Lottie Animation */}
        {showIcon && (
          <Lottie
            animationData={bellAnimation}
            loop={false}
            autoplay={true}
            style={{ width: iconSize, height: iconSize }}
          />
        )}
        
        {/* Text below */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>{icon}</span>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "#333" }}>
            {message}
          </span>
        </div>
      </div>
    );
  }

  // Layout for text to the right of the icon
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "15px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        padding: "15px 25px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        minWidth: "250px",
      }}
    >
      {/* Lottie Animation */}
      {showIcon && (
        <Lottie
          animationData={bellAnimation}
          loop={false}
          autoplay={true}
          style={{ width: iconSize, height: iconSize }}
        />
      )}
      
      {/* Text to the right */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "24px" }}>{icon}</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#333" }}>
          {message}
        </span>
      </div>
    </div>
  );
};

export default BellNotification2;
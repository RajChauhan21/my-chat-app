// // src/components/notifications/BellNotification.jsx
// import React, { useRef, useEffect, useState } from "react";
// import Lottie from "lottie-react";
// import bellAnimation from "./assets/lottie/Bell-Alert.json";

// const BellNotification = ({
//   message = "New notification",
//   type = "message", // "message", "group", "join", "friend"
//   duration = 4000, // Auto-hide after 4 seconds
//   onClose,
//   show = false,
//   showCount = true, // Show notification count badge
//   count = 1,
// }) => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [notificationCount, setNotificationCount] = useState(count);
//   const lottieRef = useRef();
//   const containerRef = useRef();

//   const formatMessage = (message) => {
//     const pattern = /^\[([^\]]+)\]\s+([^:]+):\s+(.+)$/;
//     const match = message.match(pattern);
//     console.log("Match:", match);
//     if (!match) return message;

//     const [_, group, sender, content] = match;

//     return (
//       <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//         <span
//           style={{
//             fontSize: "12px",
//             fontWeight: "600",
//             color: "#7c3aed",
//             backgroundColor: "rgba(124, 58, 237, 0.1)",
//             padding: "2px 8px",
//             borderRadius: "12px",
//           }}
//         >
//           {group}
//         </span>
//         <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
//           {sender}:
//         </span>
//         <span style={{ fontSize: "14px", color: "#555" }}>
//           {content.length > 30 ? content.substring(0, 30) + "..." : content}
//         </span>
//       </div>
//     );
//   };

//   // Show notification
//   useEffect(() => {
//     if (show) {
//       setIsVisible(true);
//       if (lottieRef.current) {
//         lottieRef.current.play();
//       }
//       // Auto-hide after duration
//       const timer = setTimeout(() => {
//         // handleClose();
//       }, duration);

//       return () => clearTimeout(timer);
//     }
//   }, [show, duration]);

//   if (!isVisible) return null;

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: "20px",
//         left: "50%",
//         transform: "translateX(-50%)",
//         zIndex: 9999,
//         display: "flex",
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "center",
//         gap: "8px", // Reduced from "2px" to "8px" for better spacing
//       }}
//     >
//       <Lottie
//         animationData={bellAnimation}
//         loop={true}
//         autoplay={true}
//         style={{ width: 40, height: 40 }} // Reduced size for better proportion
//       />
//       <h6
//         style={{
//           margin: 0,
//           fontSize: "16px",
//           fontWeight: "600",
//           color: "#333",
//           textShadow: "0 1px 2px rgba(0,0,0,0.1)", // Adds subtle text shadow for readability
//         }}
//       >
//         {formatMessage(message)}
//       </h6>
//     </div>
//   );
// };

// export default BellNotification;

// src/components/notifications/BellNotification.jsx
import React, { useRef, useEffect, useState } from "react";
import Lottie from "lottie-react";
import bellAnimation from "./assets/lottie/Bell-Alert.json";

const BellNotification = ({
  message = "New notification",
  type = "message",
  duration = 4000,
  onClose,
  show = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const lottieRef = useRef();



  const COLOR_PALETTE = [
    "#ffcfcfff",
    "#d6fffcff",
    "#f7ecd2ff",
    "#cbf7ebff",
    "#a7e6fbff",
    "#ffc1d0ff",
    "#ffeec5ff",
    "#ffc2b9ff",
    "#e0f9b8ff",
    "#c1e7ffff",
    "#e1cdfdff",
    "#ffbfe5ff",
    "#c3ebf8ff",
    "#c0f0e9ff",
    "#f3cebbff",
    "#e7cff5ff",
    "#e1fccaff",
    "#f7cfbbff",
    "#c4f1f5ff",
    "#f8d3f8ff",
  ];
  const getRandomColor = () => {
    return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
  };

  // Show notification
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      if (lottieRef.current) {
        lottieRef.current.play();
      }

      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!isVisible) return null;

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
        gap: "12px",
        backgroundColor: "#ffffff", // White background
        padding: "14px 20px",
        borderRadius: "12px",
        boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
        minWidth: "280px",
        maxWidth: "90vw", // Responsive for mobile
        width:"auto",
        border: "1px solid rgba(0,0,0,0.08)"
      }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={bellAnimation}
        loop={false}
        autoplay={true}
        style={{ width: 36, height: 36, flexShrink: 0 }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* {formatted.isFormatted ? ( */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#000000ff",
              backgroundColor: getRandomColor(),
              padding: "4px 10px",
              borderRadius: "12px",
              flexShrink: 0,
              wordBreak:"break-word",
              overflowWrap:"break-word",
              maxWidth:"100%",
              display:"inline-block",
              whiteSpace:"normal",
              lineHeight:"1.4",
            }}
          >
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BellNotification;

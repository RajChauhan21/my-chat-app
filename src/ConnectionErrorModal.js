// const ConnectionErrorModal = ({
//   isOpen,
//   onClose,
//   onRetry,
//   errorMessage,
//   retryCount,
//   maxRetries,
//   isReconnecting
// }) => {
//   const [isClosing, setIsClosing] = useState(false);

//   if (!isOpen) return null;

//   const handleClose = () => {
//     setIsClosing(true);
//     setTimeout(() => {
//       setIsClosing(false);
//       onClose();
//     }, 300);
//   };

//   const handleRetry = () => {
//     if (!isReconnecting) {
//       onRetry();
//     }
//   };

//   return (
//     <div className={`connection-error-modal ${isClosing ? 'closing' : ''}`}>
//       <div className="connection-error-content">
//         {/* Error Icon */}
//         <div className="error-icon-container">
//           <div className="error-icon">
//             <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
//               <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
//             </svg>
//           </div>
//           <div className="error-pulse"></div>
//         </div>

//         {/* Error Message */}
//         <h3>Connection Lost</h3>
//         <p className="error-desc">{errorMessage || "Unable to connect to chat server"}</p>

//         {/* Retry Info */}
//         <div className="retry-info">
//           <p>
//             <i className="bi bi-arrow-repeat me-2"></i>
//             {isReconnecting
//               ? `Reconnecting... (Attempt ${retryCount}/${maxRetries})`
//               : `Retry ${retryCount}/${maxRetries}`}
//           </p>
//         </div>

//         {/* Action Buttons */}
//         <div className="error-actions">
//           <button
//             className="btn btn-primary retry-btn"
//             onClick={handleRetry}
//             disabled={isReconnecting}
//           >
//             {isReconnecting ? (
//               <>
//                 <span className="spinner-border spinner-border-sm me-2"></span>
//                 Reconnecting...
//               </>
//             ) : (
//               <>
//                 <i className="bi bi-arrow-clockwise me-2"></i>
//                 Retry Now
//               </>
//             )}
//           </button>

//           <button
//             className="btn btn-outline-secondary close-btn"
//             onClick={handleClose}
//             disabled={isReconnecting}
//           >
//             Dismiss
//           </button>
//         </div>

//         {/* Tips */}
//         <div className="connection-tips">
//           <h6>Tips:</h6>
//           <ul>
//             <li>Check your internet connection</li>
//             <li>Verify server is running on http://localhost:8080</li>
//             <li>Try refreshing the page</li>
//             <li>Contact support if issue persists</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";

const ConnectionErrorModal = ({
  isOpen,
  onClose,
  onRetry,
  errorMessage,
  retryCount,
  maxRetries,
  isReconnecting,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const lottieRef = useRef(null);

  // Load your 404 animation
  useEffect(() => {
    try {
      // Use your first animation as 404 error animation
      const anim = require("./assets/lottie/404.json");
      setAnimationData(anim);
    } catch (error) {
      console.error("Error loading 404 animation:", error);

      // Fallback to online 404 animation if local fails
      fetch("https://assets4.lottiefiles.com/packages/lf20_khtt8ejx.json")
        .then((res) => res.json())
        .then((data) => setAnimationData(data))
        .catch((err) =>
          console.error("Failed to load fallback animation:", err)
        );
    }
  }, []);

  useEffect(() => {
    // When modal opens, play animation
    if (isOpen && lottieRef.current && animationData) {
      lottieRef.current.play();
    }
  }, [isOpen, animationData]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleRetry = () => {
    if (!isReconnecting) {
      // Play animation faster on retry click
      if (lottieRef.current) {
        lottieRef.current.setSpeed(2);
        lottieRef.current.play();
        setTimeout(() => {
          if (lottieRef.current) {
            lottieRef.current.setSpeed(1);
          }
        }, 1000);
      }
      onRetry();
    }
  };

  return (
    <div className={`connection-error-modal ${isClosing ? "closing" : ""}`}>
      <div className="connection-error-content">
        {/* 404 Lottie Animation */}
        <div className="error-animation-container">
          {animationData ? (
            <Lottie
              lottieRef={lottieRef}
              animationData={animationData}
              loop={true}
              autoplay={true}
              style={{
                width: "200px",
                height: "200px",
                margin: "0 auto",
              }}
            />
          ) : (
            <div className="error-icon-fallback">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100"
                height="100"
                fill="#dc3545"
                viewBox="0 0 16 16"
              >
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
              </svg>
            </div>
          )}

          {/* 404 Text Overlay */}
          <div className="error-code">404</div>
        </div>

        {/* Error Message */}
        <h3 className="error-title">Connection Lost</h3>
        <p className="error-description">
          {errorMessage || "Chat server connection failed"}
        </p>

        <div className="error-subtext">
          <i className="bi bi-wifi-off me-2"></i>
          Unable to establish WebSocket connection
        </div>

        {/* Retry Info */}
        <div className="retry-info">
          <p>
            <i className="bi bi-arrow-repeat me-2"></i>
            {isReconnecting
              ? `Reconnecting... (Attempt ${retryCount}/${maxRetries})`
              : `Retry ${retryCount}/${maxRetries}`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="error-actions">
          <button
            className="btn btn-primary retry-btn"
            onClick={handleRetry}
            disabled={isReconnecting}
          >
            {isReconnecting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Reconnecting...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Retry Connection
              </>
            )}
          </button>

          <button
            className="btn btn-outline-secondary close-btn"
            onClick={handleClose}
            disabled={isReconnecting}
          >
            Dismiss
          </button>
        </div>

        {/* Tips */}
        <div className="connection-tips">
          <h6>
            <i className="bi bi-lightbulb me-2"></i>Troubleshooting Tips
          </h6>
          <ul>
            <li>
              <i className="bi bi-check-circle me-2"></i>Check your internet
              connection
            </li>
            <li>
              <i className="bi bi-server me-2"></i>Verify server is running on
              http://localhost:8080
            </li>
            <li>
              <i className="bi bi-arrow-clockwise me-2"></i>Try refreshing the
              page
            </li>
            <li>
              <i className="bi bi-chat-dots me-2"></i>Contact support if issue
              persists
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConnectionErrorModal;

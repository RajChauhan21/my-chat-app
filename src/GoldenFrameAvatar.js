import React, { useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";

const GoldenFrameAvatar = ({
  letter,
  name = "", // Optional: full name for tooltip
  size = 70,
  backgroundColor = "#667eea", // Background color for letter
  textColor = "#000000ff", // Letter color
  frameAnimation = null, // Your golden frame animation
  isOnline = false,
  className = "",
  onClick = () => {},
}) => {
  const [animation, setAnimation] = useState(null);
  const lottieRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Load your golden frame animation
  useEffect(() => {
    if (frameAnimation) {
      setAnimation(frameAnimation);
    } else {
      // Try to load your animation file
      try {
        const anim = require("./assets/lottie/Profile.json"); // Your golden frame
        setAnimation(anim);
      } catch (error) {
        console.error("Error loading golden frame animation:", error);
        // Fallback to a simple animation
        setAnimation(createSimpleFrame());
      }
    }
  }, [frameAnimation]);

  // Simple fallback frame
  const createSimpleFrame = () => {
    return {
      v: "5.7.0",
      fr: 30,
      ip: 0,
      op: 60,
      w: 100,
      h: 100,
      layers: [
        {
          ty: 4,
          shapes: [
            {
              ty: "gr",
              it: [
                {
                  ty: "el",
                  p: { a: 0, k: [50, 50] },
                  s: { a: 0, k: [45, 45] },
                },
                {
                  ty: "st",
                  c: { a: 0, k: [1, 0.843, 0, 1] },
                  w: { a: 0, k: 4 },
                },
              ],
            },
          ],
        },
      ],
    };
  };

  return (
    <div
      className={`golden-frame-avatar ${className}`}
      style={{
        position: "relative",
        width: size,
        height: size,
        cursor: "pointer",
        userSelect: "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      title={name} // Tooltip with full name
    >
      {/* Background Circle for Letter */}
      <div
        className="letter-background"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: size * 0.65,
          height: size * 0.65,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${backgroundColor} 0%, ${darkenColor(
            backgroundColor,
            20
          )} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isHovered
            ? `0 0 25px ${backgroundColor}80`
            : `0 0 15px ${backgroundColor}40`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {/* Letter with subtle animation */}
        <span
          className="avatar-letter"
          style={{
            color: textColor,
            fontFamily: '"Josefin Sans", sans-serif',
            fontSize: size * 0.32,
            fontWeight: "700",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            transform: isHovered
              ? "scale(1.15) rotate(5deg)"
              : "scale(1) rotate(0deg)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            lineHeight: 1,
            position: "absolute",
          }}
        >
          {letter.toUpperCase()}
        </span>
      </div>

      {/* Golden Frame Animation */}
      {animation && (
        <div
          className="frame-animation-wrapper"
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            zIndex: 2,
            pointerEvents: "none",
            opacity: isHovered ? 1 : 0.95,
            transform: isHovered
              ? "scale(1.08) rotate(5deg)"
              : "scale(1) rotate(0deg)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={animation}
            loop={true}
            autoplay={true}
            style={{
              width: "100%",
              height: "100%",
              filter: isHovered
                ? "brightness(1.3) drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))"
                : "brightness(1) drop-shadow(0 0 4px rgba(255, 215, 0, 0.3))",
              transition: "filter 0.3s ease",
            }}
          />
        </div>
      )}

      {/* Online Status Indicator */}
      {isOnline && (
        <div
          className="online-indicator"
          style={{
            position: "absolute",
            bottom: size * 0.08,
            right: size * 0.08,
            width: size * 0.2,
            height: size * 0.2,
            backgroundColor: "#4CAF50",
            border: "2px solid white",
            borderRadius: "50%",
            zIndex: 3,
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            animation: "pulse 2s infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "60%",
              height: "60%",
              backgroundColor: "white",
              borderRadius: "50%",
              opacity: 0.8,
            }}
          />
        </div>
      )}

      {/* Hover Effect Ring */}
      <div
        className="hover-ring"
        style={{
          position: "absolute",
          top: "-5%",
          left: "-5%",
          right: "-5%",
          bottom: "-5%",
          borderRadius: "50%",
          border: `2px solid ${backgroundColor}40`,
          zIndex: 0,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "scale(1)" : "scale(0.8)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// Helper function to darken colors
const darkenColor = (color, percent) => {
  // Simplified color manipulation
  return color; // In production, use a color library like 'chroma-js'
};

export default GoldenFrameAvatar;

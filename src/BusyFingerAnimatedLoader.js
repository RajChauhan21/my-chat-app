// src/components/loaders/GroupCreationLoader.jsx
import React, { useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";
import fingerLoading from "./assets/lottie/updatedloader.json";

const BusyFingerAnimationLoader = ({
  title = "Processing...",
  subtitle = "Please wait",
  size = 300,
  show = false,
}) => {
  const lottieRef = useRef();

  useEffect(() => {
    if (lottieRef.current && show) {
      lottieRef.current.play();
    }
  }, [show]);
  if (!show) return null;

  return (
    <div className="overlay-loader minimal-loader">
      {/* <div className="loader-content"> */}
        <div className="loader-animation">
          <Lottie
            lottieRef={lottieRef}
            animationData={fingerLoading}
            loop={true}
            autoplay={true}
            style={{ width: size, height: size }}
          />
          {/* <h4 className="loader-title">{title}</h4> */}
        </div>
        
      {/* </div> */}
    </div>
  );
};

export default BusyFingerAnimationLoader;

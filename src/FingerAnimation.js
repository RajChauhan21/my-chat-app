import React from 'react';
import Lottie from "lottie-react";  
import fingerLoading from "public/loading.json";  

const FingerAnimation = ({ 
  size = 60, 
  speed = 1,
  className = '' 
}) => {
  return (
    <div className={`typing-loader ${className}`}>
      <Lottie
        animationData={fingerLoading}
        loop={true}
        autoplay={true}
        style={{
          width: size,
          height: size,
        }}
        speed={speed}
      />
    </div>
  );
};

export default FingerAnimation;
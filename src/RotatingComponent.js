import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

const RotatingComponent = () => {
  const [animations, setAnimations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load your 3 animation files
  const animation1 = require('./assets/lottie/animation1.json');
  const animation2 = require('./assets/lottie/animation2.json');
  const animation3 = require('./assets/lottie/animation3.json');

  useEffect(() => {
    setAnimations([animation1, animation2, animation3]);
    
    // Rotate every 3 seconds for messages background (slower than main background)
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (animations.length === 0) return null;

  return (
    <div className="messages-background-animation">
      <Lottie
        animationData={animations[currentIndex]}
        loop={true}
        autoplay={true}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.4, // Very subtle for messages background
          zIndex: 0,
          pointerEvents: 'none',
          filter: 'blur(1px)',
        }}
      />
      
      {/* Gradient overlay for better readability */}
      <div 
        className="messages-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default RotatingComponent;
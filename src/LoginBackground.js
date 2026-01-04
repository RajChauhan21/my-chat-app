import React from "react";
import { useEffect } from "react";

const LoginBackground = () => {
  useEffect(() => {
    const particlesContainer = document.querySelector('.auth-background');
    if (!particlesContainer) return;
    
    // Create particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random properties
      const size = Math.random() * 10 + 5;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const duration = Math.random() * 10 + 10;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.animation = `floatParticle ${duration}s ease-in-out infinite`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      
      particlesContainer.appendChild(particle);
    }
  }, []);

  return <div className="auth-background"></div>;
};

export default LoginBackground;
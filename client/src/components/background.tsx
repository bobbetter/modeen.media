import React from 'react';
import { motion } from 'framer-motion';
import producerSilhouette from '../assets/producer-silhouette.png';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Dark gradient base background with warmer dark tones */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0805] via-[#121012] to-[#0D0A08]" />
      
      {/* Full-screen producer silhouette image */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `url(${producerSilhouette})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Beige/warm lighting effects on the silhouette */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#C2A278]/10 via-[#A89078]/5 to-transparent" />
      </div>
      
      {/* Animated particle overlay */}
      <div className="absolute inset-0 opacity-20">
        <ParticleField />
      </div>
      
      {/* Gradient overlays for depth with warm tones */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#1A0F05]/40 via-transparent to-[#2B1E10]/30" />
      
      {/* Beige/gold accent lighting */}
      <div className="absolute top-[-10%] left-[30%] w-[600px] h-[600px] rounded-full bg-[#C2A278]/10 blur-[150px]" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#A89078]/5 blur-[100px]" />
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#000_120%)] opacity-60" />
    </div>
  );
}

// Particle animation component
function ParticleField() {
  // Generate random particles
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 10
  }));

  return (
    <div className="h-full w-full absolute">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-[#DBC1A0]/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            opacity: [0, 0.2, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
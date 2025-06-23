import React from 'react';
import { motion } from 'framer-motion';
import { GRADIENTS, MODERN_COLORS } from '../../constants/modern-design-system';

interface AnimatedShieldProps {
  size?: number;
  className?: string;
}

export const AnimatedShield: React.FC<AnimatedShieldProps> = ({ size = 120, className = '' }) => {
  // Animation variants for the shield
  const shieldVariants = {
    initial: {
      scale: 0.8,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.68, -0.55, 0.265, 1.55],
      },
    },
  };

  // Animation for the protective aura
  const auraVariants = {
    initial: {
      scale: 0.9,
      opacity: 0,
    },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Animation for connection lines
  const lineVariants = {
    initial: {
      pathLength: 0,
      opacity: 0,
    },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2,
        delay: 0.5,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Protective Aura */}
      <motion.div
        variants={auraVariants}
        initial="initial"
        animate="animate"
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${MODERN_COLORS.primary[500]}40 0%, transparent 70%)`,
        }}
      />

      {/* Main Shield */}
      <motion.svg
        viewBox="0 0 120 120"
        className="relative z-10"
        variants={shieldVariants}
        initial="initial"
        animate="animate"
      >
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={MODERN_COLORS.primary[500]} />
            <stop offset="100%" stopColor={MODERN_COLORS.primary[700]} />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Shield Path */}
        <path
          d="M60 10 L90 30 L90 70 C90 85 75 100 60 105 C45 100 30 85 30 70 L30 30 Z"
          fill="url(#shieldGradient)"
          stroke={MODERN_COLORS.primary[600]}
          strokeWidth="2"
          filter="url(#glow)"
        />

        {/* Center Lock Icon */}
        <g transform="translate(60, 55)">
          <motion.rect
            x="-10"
            y="-5"
            width="20"
            height="15"
            rx="2"
            fill={MODERN_COLORS.neutral[50]}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          />
          <motion.path
            d="M-8 -5 L-8 -10 A8 8 0 0 1 8 -10 L8 -5"
            fill="none"
            stroke={MODERN_COLORS.neutral[50]}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, duration: 0.3 }}
          />
          <motion.circle
            cx="0"
            cy="2"
            r="2"
            fill={MODERN_COLORS.primary[700]}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, duration: 0.3 }}
          />
        </g>
      </motion.svg>

      {/* Connection Lines */}
      <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 120 120">
        {/* Top connections */}
        <motion.path
          d="M60 55 L30 25"
          stroke={MODERN_COLORS.primary[400]}
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
          variants={lineVariants}
          initial="initial"
          animate="animate"
        />
        <motion.path
          d="M60 55 L90 25"
          stroke={MODERN_COLORS.primary[400]}
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
          variants={lineVariants}
          initial="initial"
          animate="animate"
        />
        
        {/* Bottom connections */}
        <motion.path
          d="M60 55 L30 85"
          stroke={MODERN_COLORS.primary[400]}
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
          variants={lineVariants}
          initial="initial"
          animate="animate"
        />
        <motion.path
          d="M60 55 L90 85"
          stroke={MODERN_COLORS.primary[400]}
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
          variants={lineVariants}
          initial="initial"
          animate="animate"
        />

        {/* Connection dots */}
        <motion.circle
          cx="30"
          cy="25"
          r="4"
          fill={MODERN_COLORS.primary[500]}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2, duration: 0.3 }}
        />
        <motion.circle
          cx="90"
          cy="25"
          r="4"
          fill={MODERN_COLORS.primary[500]}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2.1, duration: 0.3 }}
        />
        <motion.circle
          cx="30"
          cy="85"
          r="4"
          fill={MODERN_COLORS.primary[500]}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2.2, duration: 0.3 }}
        />
        <motion.circle
          cx="90"
          cy="85"
          r="4"
          fill={MODERN_COLORS.primary[500]}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2.3, duration: 0.3 }}
        />
      </svg>
    </div>
  );
};
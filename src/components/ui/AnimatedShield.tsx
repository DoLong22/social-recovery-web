import React from 'react';
import { motion } from 'framer-motion';
import { VIBRANT_COLORS } from '../../constants/vibrant-design-system';

interface AnimatedShieldProps {
  size?: number;
  className?: string;
}

export const AnimatedShield: React.FC<AnimatedShieldProps> = ({ size = 90, className = '' }) => {
  // Floating animation
  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };
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
        ease: [0.68, -0.55, 0.265, 1.55] as const,
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
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <motion.div 
      className={`relative ${className}`} 
      style={{ width: size, height: size }}
      animate={floatingAnimation}
    >
      {/* Removed blur aura for cleaner look */}

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
            <stop offset="0%" stopColor={VIBRANT_COLORS.glowGreen} stopOpacity="1" />
            <stop offset="50%" stopColor={VIBRANT_COLORS.electricTeal} stopOpacity="1" />
            <stop offset="100%" stopColor={VIBRANT_COLORS.electricBlue} stopOpacity="1" />
          </linearGradient>
          
          <linearGradient id="shieldBorderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={VIBRANT_COLORS.pureWhite} stopOpacity="0.9" />
            <stop offset="50%" stopColor={VIBRANT_COLORS.electricBlue} stopOpacity="1" />
            <stop offset="100%" stopColor={VIBRANT_COLORS.deepViolet} stopOpacity="1" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="0" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="shieldShadow">
            <feDropShadow dx="0" dy="8" stdDeviation="10" flood-opacity="0.3" flood-color="#000000"/>
          </filter>
        </defs>

        {/* Outer border for extra clarity */}
        <path
          d="M60 10 L90 30 L90 70 C90 85 75 100 60 105 C45 100 30 85 30 70 L30 30 Z"
          fill="none"
          stroke={VIBRANT_COLORS.pureWhite}
          strokeWidth="6"
          opacity="0.5"
        />
        
        {/* Shield Path */}
        <path
          d="M60 10 L90 30 L90 70 C90 85 75 100 60 105 C45 100 30 85 30 70 L30 30 Z"
          fill="url(#shieldGradient)"
          stroke="url(#shieldBorderGradient)"
          strokeWidth="4"
          filter="url(#glow)"
          style={{ 
            filter: 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.2))',
            paintOrder: 'stroke fill'
          }}
        />

        {/* Center Lock Icon with enhanced visibility */}
        <g transform="translate(60, 55)">
          {/* Lock background for contrast */}
          <motion.rect
            x="-12"
            y="-7"
            width="24"
            height="19"
            rx="3"
            fill={VIBRANT_COLORS.darkCarbon}
            opacity="0.3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          />
          <motion.rect
            x="-10"
            y="-5"
            width="20"
            height="15"
            rx="2"
            fill={VIBRANT_COLORS.pureWhite}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          />
          <motion.path
            d="M-8 -5 L-8 -10 A8 8 0 0 1 8 -10 L8 -5"
            fill="none"
            stroke={VIBRANT_COLORS.pureWhite}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, duration: 0.3 }}
          />
          <motion.circle
            cx="0"
            cy="2"
            r="3"
            fill={VIBRANT_COLORS.electricBlue}
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
          stroke={VIBRANT_COLORS.neonPurple}
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
          variants={lineVariants}
          initial="initial"
          animate="animate"
        />
        <motion.path
          d="M60 55 L90 25"
          stroke={VIBRANT_COLORS.neonPurple}
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
          stroke={VIBRANT_COLORS.neonPurple}
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
          variants={lineVariants}
          initial="initial"
          animate="animate"
        />
        <motion.path
          d="M60 55 L90 85"
          stroke={VIBRANT_COLORS.neonPurple}
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
          fill={VIBRANT_COLORS.radiantOrange}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2, duration: 0.3 }}
        />
        <motion.circle
          cx="90"
          cy="25"
          r="4"
          fill={VIBRANT_COLORS.radiantOrange}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2.1, duration: 0.3 }}
        />
        <motion.circle
          cx="30"
          cy="85"
          r="4"
          fill={VIBRANT_COLORS.radiantOrange}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2.2, duration: 0.3 }}
        />
        <motion.circle
          cx="90"
          cy="85"
          r="4"
          fill={VIBRANT_COLORS.radiantOrange}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2.3, duration: 0.3 }}
        />
      </svg>
      {/* Removed additional glow layer */}
    </motion.div>
  );
};
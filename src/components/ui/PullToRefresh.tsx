import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startY || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
      
      if (distance > threshold) {
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      // Animate to loading position
      await controls.start({
        y: threshold,
        transition: { type: "spring", stiffness: 300 }
      });
      
      // Perform refresh
      await onRefresh();
      
      // Reset
      setIsRefreshing(false);
      setPullDistance(0);
      await controls.start({
        y: 0,
        transition: { type: "spring", stiffness: 300 }
      });
    } else {
      // Spring back
      setPullDistance(0);
      controls.start({
        y: 0,
        transition: { type: "spring", stiffness: 300 }
      });
    }
    
    setStartY(0);
  };

  const rotation = (pullDistance / threshold) * 180;
  const scale = Math.min(pullDistance / threshold, 1);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Pull indicator */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-10">
        <motion.div
          animate={controls}
          style={{ y: pullDistance - 40 }}
          className="mt-2"
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : rotation }}
            transition={{ 
              duration: isRefreshing ? 1 : 0,
              repeat: isRefreshing ? Infinity : 0,
              ease: "linear"
            }}
            style={{ scale }}
            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <span className="text-xl">🔄</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        animate={controls}
        className="h-full overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        {children}
      </motion.div>
    </div>
  );
};
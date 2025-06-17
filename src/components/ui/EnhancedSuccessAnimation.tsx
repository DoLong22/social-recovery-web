import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface EnhancedSuccessAnimationProps {
  isVisible: boolean;
  message?: string;
  onComplete?: () => void;
}

export const EnhancedSuccessAnimation: React.FC<EnhancedSuccessAnimationProps> = ({
  isVisible,
  message = 'Success!',
  onComplete
}) => {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (isVisible && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      
      // Trigger confetti
      const count = 200;
      const defaults = {
        origin: { y: 0.7 }
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });

      // Auto dismiss after 3 seconds
      const timer = setTimeout(() => {
        hasTriggeredRef.current = false;
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => {
            hasTriggeredRef.current = false;
            onComplete?.();
          }}
        >
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          />

          {/* Success modal */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-md mx-4"
          >
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 3 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute -top-8 -left-8 w-32 h-32 bg-green-100 rounded-full opacity-50"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 2.5 }}
                transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                className="absolute -bottom-8 -right-8 w-40 h-40 bg-blue-100 rounded-full opacity-50"
              />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Success icon container */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1
                }}
                className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-lg"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{
                    delay: 0.3,
                    duration: 0.5,
                    times: [0, 0.6, 1]
                  }}
                >
                  <CheckmarkIcon />
                </motion.div>
              </motion.div>
              
              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                Congratulations! 🎉
              </motion.h2>

              {/* Message */}
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600 mb-6"
                >
                  {message}
                </motion.p>
              )}

              {/* Progress indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center space-x-1"
              >
                <span className="text-sm text-gray-500">Redirecting</span>
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex space-x-1"
                >
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CheckmarkIcon: React.FC = () => (
  <svg
    className="w-12 h-12 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{
        duration: 0.4,
        ease: "easeInOut"
      }}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 13l4 4L19 7"
    />
  </svg>
);

// Enhanced hook with single trigger logic
export const useEnhancedSuccessAnimation = () => {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');
  const hasTriggeredRef = useRef(false);

  const triggerSuccess = React.useCallback((message?: string) => {
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setSuccessMessage(message || 'Success!');
      setShowSuccess(true);
    }
  }, []);

  const resetTrigger = React.useCallback(() => {
    hasTriggeredRef.current = false;
    setShowSuccess(false);
  }, []);

  const SuccessComponent = () => (
    <EnhancedSuccessAnimation
      isVisible={showSuccess}
      message={successMessage}
      onComplete={resetTrigger}
    />
  );

  return { triggerSuccess, SuccessComponent, resetTrigger };
};
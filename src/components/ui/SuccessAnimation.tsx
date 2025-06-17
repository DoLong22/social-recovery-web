import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessAnimationProps {
  isVisible: boolean;
  message?: string;
  onComplete?: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  isVisible,
  message = 'Success!',
  onComplete
}) => {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 2000);
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
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          {/* Background blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white bg-opacity-90"
          />

          {/* Success content */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="relative"
          >
            <div className="bg-white rounded-full p-8 shadow-2xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{
                  delay: 0.2,
                  duration: 0.5,
                  times: [0, 0.6, 1]
                }}
              >
                <CheckmarkIcon />
              </motion.div>
            </div>
            
            {message && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-4 text-lg font-semibold text-gray-900"
              >
                {message}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CheckmarkIcon: React.FC = () => (
  <svg
    className="w-16 h-16 text-green-500"
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

// Hook for easy usage
export const useSuccessAnimation = () => {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const triggerSuccess = (message?: string) => {
    setSuccessMessage(message || 'Success!');
    setShowSuccess(true);
  };

  const SuccessComponent = () => (
    <SuccessAnimation
      isVisible={showSuccess}
      message={successMessage}
      onComplete={() => setShowSuccess(false)}
    />
  );

  return { triggerSuccess, SuccessComponent };
};
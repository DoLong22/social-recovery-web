import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  showPercentage?: boolean;
  height?: number;
  variant?: 'default' | 'gradient' | 'striped';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showPercentage = false,
  height = 8,
  variant = 'gradient',
  color = 'primary',
  label,
  className = ''
}) => {
  const percentage = Math.min(Math.max(value, 0), 100);
  
  const colors = {
    primary: 'from-primary-400 to-primary-600',
    success: 'from-success-400 to-success-600',
    warning: 'from-warning-400 to-warning-600',
    danger: 'from-danger-400 to-danger-600'
  };

  const bgColors = {
    primary: 'bg-primary-100',
    success: 'bg-success-100',
    warning: 'bg-warning-100',
    danger: 'bg-danger-100'
  };

  const variants = {
    default: 'bg-gradient-to-r',
    gradient: 'bg-gradient-to-r',
    striped: 'bg-gradient-to-r bg-[length:40px_40px] animate-[progress_1s_linear_infinite]'
  };
  
  return (
    <div className={`w-full ${className}`}>
      {(showPercentage || label) && (
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="font-medium text-gray-700">{label || 'Progress'}</span>
          {showPercentage && (
            <motion.span 
              className="font-semibold text-gray-900"
              key={percentage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
        </div>
      )}
      
      <div 
        className={`w-full ${bgColors[color]} rounded-full overflow-hidden relative`}
        style={{ height }}
      >
        <motion.div
          className={`
            h-full rounded-full relative overflow-hidden
            ${variants[variant]} ${colors[color]}
            ${variant === 'striped' ? 'bg-stripes' : ''}
          `}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut",
            delay: 0.1
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
        
        {/* Percentage label inside bar for values > 20% */}
        {showPercentage && percentage > 20 && (
          <motion.div
            className="absolute inset-0 flex items-center px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-xs font-semibold text-white drop-shadow-sm">
              {Math.round(percentage)}%
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

interface StepDotsProps {
  totalSteps: number;
  currentStep: number;
  variant?: 'dots' | 'numbers' | 'progress';
  className?: string;
}

export const StepDots: React.FC<StepDotsProps> = ({
  totalSteps,
  currentStep,
  variant = 'dots',
  className = ''
}) => {
  if (variant === 'progress') {
    return (
      <div className={`w-full max-w-xs mx-auto ${className}`}>
        <ProgressBar 
          value={(currentStep / totalSteps) * 100} 
          height={4}
          variant="gradient"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${variant === 'numbers' ? 'space-x-4' : 'space-x-2'} ${className}`}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const isActive = index < currentStep;
        const isCurrent = index === currentStep - 1;
        
        return (
          <motion.div
            key={index}
            className="relative"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: index * 0.05,
              type: "spring",
              stiffness: 500,
              damping: 25
            }}
          >
            {variant === 'numbers' ? (
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                transition-all duration-300
                ${isCurrent 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110' 
                  : isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-400'
                }
              `}>
                {index + 1}
              </div>
            ) : (
              <div className={`
                rounded-full transition-all duration-300
                ${isCurrent 
                  ? 'w-8 h-3 bg-primary-500 shadow-lg shadow-primary-500/30' 
                  : isActive 
                    ? 'w-3 h-3 bg-primary-400' 
                    : 'w-2 h-2 bg-gray-300'
                }
              `} />
            )}
            
            {/* Connecting line for numbers variant */}
            {variant === 'numbers' && index < totalSteps - 1 && (
              <motion.div 
                className={`
                  absolute top-1/2 left-full w-8 h-0.5 -translate-y-1/2
                  ${isActive ? 'bg-primary-300' : 'bg-gray-200'}
                `}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

// Add striped background pattern in CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes progress {
    0% { background-position: 0 0; }
    100% { background-position: 40px 0; }
  }
  
  .bg-stripes {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
  }
`;
document.head.appendChild(style);
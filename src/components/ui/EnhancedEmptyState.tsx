import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { AnimatedShield } from './AnimatedShield';
import { useAccessibility } from '../../hooks/useAccessibility';

interface EnhancedEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  useAnimatedIcon?: boolean;
}

export const EnhancedEmptyState: React.FC<EnhancedEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  useAnimatedIcon = true
}) => {
  const { prefersReducedMotion } = useAccessibility();
  return (
    <motion.div 
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      {/* Icon Container */}
      <motion.div
        initial={prefersReducedMotion ? {} : { scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.2 }}
        className="mb-8"
      >
        {useAnimatedIcon && !prefersReducedMotion ? (
          <AnimatedShield size={48} />
        ) : (
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
            {icon || <Shield className="w-12 h-12 text-blue-600" />}
          </div>
        )}
      </motion.div>
      
      {/* Title */}
      <h3 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
        {title}
      </h3>
      
      {/* Description */}
      {description && (
        <p className="text-base text-gray-600 mb-10 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      
      {/* Action Button */}
      {action && (
        <motion.button
          onClick={action.onClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 text-lg shadow-sm hover:shadow-md active:scale-[0.98] min-w-[200px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          aria-label={action.label}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};
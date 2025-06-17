import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  rightIcon,
  variant = 'default',
  size = 'md',
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const variants = {
    default: `
      border-2 bg-white
      ${error 
        ? 'border-red-300 focus:border-red-500' 
        : isFocused 
          ? 'border-blue-500' 
          : 'border-gray-200 hover:border-gray-300'
      }
    `,
    filled: `
      border-2 border-transparent bg-gray-100
      ${error 
        ? 'bg-red-50 focus:bg-red-100' 
        : 'focus:bg-gray-50 hover:bg-gray-50'
      }
    `,
    ghost: `
      border-0 border-b-2 rounded-none bg-transparent px-0
      ${error 
        ? 'border-red-300 focus:border-red-500' 
        : isFocused 
          ? 'border-blue-500' 
          : 'border-gray-300 hover:border-gray-400'
      }
    `
  };

  return (
    <div className="w-full">
      {label && (
        <motion.label 
          className={`
            block font-medium mb-2 transition-colors duration-200
            ${isFocused ? 'text-blue-600' : 'text-gray-700'}
            ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}
          `}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      <div className="relative">
        {icon && (
          <div className={`
            absolute inset-y-0 left-0 flex items-center pointer-events-none
            ${variant === 'ghost' ? '' : 'pl-3'}
            ${isFocused ? 'text-blue-500' : 'text-gray-400'}
            transition-colors duration-200
          `}>
            <span className={iconSizes[size]}>{icon}</span>
          </div>
        )}
        <input
          className={`
            w-full rounded-xl text-gray-900 
            placeholder-gray-400 transition-all duration-300
            ${sizes[size]}
            ${icon && variant !== 'ghost' ? 'pl-11' : ''}
            ${rightIcon && variant !== 'ghost' ? 'pr-11' : ''}
            ${variants[variant]}
            focus:outline-none focus:ring-4 focus:ring-blue-500/20
            disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50
            ${className}
          `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          <div className={`
            absolute inset-y-0 right-0 flex items-center
            ${variant === 'ghost' ? '' : 'pr-3'}
            ${isFocused ? 'text-blue-500' : 'text-gray-400'}
            transition-colors duration-200
          `}>
            <span className={iconSizes[size]}>{rightIcon}</span>
          </div>
        )}
        
        {/* Focus indicator line for default variant */}
        {variant === 'default' && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-b-xl"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isFocused ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.p 
            className="mt-2 text-sm text-red-600 flex items-center gap-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.p>
        )}
        {hint && !error && (
          <motion.p 
            className="mt-2 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../../constants/modern-design-system';
import { VIBRANT_COLORS, VIBRANT_GRADIENTS, VIBRANT_SHADOWS } from '../../constants/vibrant-design-system';

interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'right',
  className = '',
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Base classes
  const baseClasses = `
    relative overflow-hidden font-semibold rounded-xl
    transition-all duration-${ANIMATIONS.fast}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
  `;

  // Variant styles
  const variantStyles = {
    primary: {
      background: VIBRANT_GRADIENTS.primaryAction,
      color: VIBRANT_COLORS.pureWhite,
      boxShadow: disabled ? 'none' : VIBRANT_SHADOWS.primaryGlow,
      hoverBoxShadow: '0px 8px 20px rgba(0, 123, 255, 0.25), 0px 4px 10px rgba(94, 0, 255, 0.2)',
      border: undefined,
    },
    secondary: {
      background: VIBRANT_GRADIENTS.successGradient,
      color: VIBRANT_COLORS.pureWhite,
      boxShadow: disabled ? 'none' : VIBRANT_SHADOWS.successGlow,
      hoverBoxShadow: '0px 6px 15px rgba(0, 230, 118, 0.25), 0px 3px 8px rgba(110, 255, 0, 0.2)',
      border: undefined,
    },
    success: {
      background: VIBRANT_GRADIENTS.ctaOrange,
      color: VIBRANT_COLORS.pureWhite,
      boxShadow: disabled ? 'none' : VIBRANT_SHADOWS.warningGlow,
      hoverBoxShadow: '0px 6px 15px rgba(255, 127, 0, 0.25), 0px 3px 8px rgba(255, 69, 0, 0.2)',
      border: undefined,
    },
    ghost: {
      background: 'transparent',
      color: VIBRANT_COLORS.electricBlue,
      boxShadow: 'none',
      hoverBoxShadow: 'none',
      border: `2px solid ${VIBRANT_COLORS.electricBlue}`,
    },
  };

  const style = variantStyles[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${className}`}
      style={{
        background: style.background,
        color: style.color,
        boxShadow: style.boxShadow,
        border: style.border,
      }}
      whileHover={
        !disabled && !loading
          ? {
              scale: 1.02,
              boxShadow: style.hoverBoxShadow,
            }
          : {}
      }
      whileTap={
        !disabled && !loading
          ? {
              scale: 0.98,
            }
          : {}
      }
    >
      {/* Gradient overlay for hover effect */}
      <motion.div
        className="absolute inset-0 opacity-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      />

      {/* Button content */}
      <div className="relative flex items-center justify-center gap-2">
        {loading ? (
          <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && <span>{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span>{icon}</span>}
          </>
        )}
      </div>

      {/* Ripple effect */}
      {!disabled && !loading && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileTap={{ opacity: 1 }}
        >
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
            }}
            initial={{ scale: 0 }}
            whileTap={{ scale: 1 }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      )}
    </motion.button>
  );
};
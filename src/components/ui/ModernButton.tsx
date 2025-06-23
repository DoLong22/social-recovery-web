import React from 'react';
import { motion } from 'framer-motion';
import { GRADIENTS, SHADOWS, MODERN_COLORS, ANIMATIONS } from '../../constants/modern-design-system';

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
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
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
      background: GRADIENTS.primaryButton,
      color: MODERN_COLORS.neutral[50],
      boxShadow: disabled ? 'none' : SHADOWS.buttonPrimary,
      hoverBoxShadow: SHADOWS.buttonPrimaryHover,
    },
    secondary: {
      background: GRADIENTS.greenButton,
      color: MODERN_COLORS.neutral[50],
      boxShadow: disabled ? 'none' : '0px 8px 15px rgba(60, 207, 78, 0.3)',
      hoverBoxShadow: '0px 12px 20px rgba(60, 207, 78, 0.4)',
    },
    success: {
      background: GRADIENTS.greenButton,
      color: MODERN_COLORS.neutral[50],
      boxShadow: disabled ? 'none' : '0px 8px 15px rgba(60, 207, 78, 0.3)',
      hoverBoxShadow: '0px 12px 20px rgba(60, 207, 78, 0.4)',
    },
    ghost: {
      background: 'transparent',
      color: MODERN_COLORS.primary[600],
      boxShadow: 'none',
      hoverBoxShadow: 'none',
      border: `2px solid ${MODERN_COLORS.primary[600]}`,
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
        transition={{ duration: ANIMATIONS.fast }}
      />

      {/* Button content */}
      <div className="relative flex items-center justify-center gap-2">
        {loading ? (
          <motion.div
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
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
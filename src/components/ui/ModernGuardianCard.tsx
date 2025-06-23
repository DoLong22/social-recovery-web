import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Wallet, Trash2 } from 'lucide-react';
import { GuardianType } from '../../api/guardian';
import { MODERN_COLORS, GRADIENTS, SHADOWS } from '../../constants/modern-design-system';

interface Guardian {
  type: GuardianType;
  contactInfo: string;
  name: string;
}

interface ModernGuardianCardProps {
  guardian: Guardian;
  index: number;
  onRemove: () => void;
}

export const ModernGuardianCard: React.FC<ModernGuardianCardProps> = ({
  guardian,
  index,
  onRemove,
}) => {
  // Get guardian type styling
  const getGuardianStyle = (type: GuardianType) => {
    switch (type) {
      case GuardianType.EMAIL:
        return {
          icon: Mail,
          gradient: 'linear-gradient(135deg, #3A86FF 0%, #2E6FCC 100%)',
          bgColor: MODERN_COLORS.primary[50],
          iconColor: MODERN_COLORS.primary[600],
          label: 'Email Guardian',
        };
      case GuardianType.PHONE:
        return {
          icon: Phone,
          gradient: 'linear-gradient(135deg, #3CCF4E 0%, #30A63E 100%)',
          bgColor: MODERN_COLORS.accent.green[50],
          iconColor: MODERN_COLORS.accent.green[600],
          label: 'Phone Guardian',
        };
      case GuardianType.WALLET:
        return {
          icon: Wallet,
          gradient: 'linear-gradient(135deg, #8E44AD 0%, #7236A6 100%)',
          bgColor: MODERN_COLORS.accent.purple[50],
          iconColor: MODERN_COLORS.accent.purple[600],
          label: 'Wallet Guardian',
        };
      default:
        return {
          icon: Mail,
          gradient: 'linear-gradient(135deg, #3A86FF 0%, #2E6FCC 100%)',
          bgColor: MODERN_COLORS.primary[50],
          iconColor: MODERN_COLORS.primary[600],
          label: 'Guardian',
        };
    }
  };

  const style = getGuardianStyle(guardian.type);
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95, x: 20, height: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className='relative group'
    >
      <motion.div
        className='bg-white rounded-xl border border-gray-200 p-4 transition-all duration-200'
        style={{ boxShadow: SHADOWS.cardSoft }}
        whileHover={{
          boxShadow: SHADOWS.cardHover,
          scale: 1.02,
        }}
      >
        {/* Guardian content */}
        <div className='flex items-center gap-3'>
          {/* Icon with gradient background */}
          <motion.div
            className='w-12 h-12 rounded-xl flex items-center justify-center relative'
            style={{ background: style.gradient }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className='w-6 h-6 text-white' />
            
            {/* Subtle glow effect */}
            <div
              className='absolute inset-0 rounded-xl opacity-30 blur-lg'
              style={{ background: style.gradient }}
            />
          </motion.div>

          {/* Guardian info */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <p className='font-semibold text-gray-900 truncate'>
                {guardian.name}
              </p>
              <span
                className='px-2 py-0.5 rounded-full text-xs font-medium'
                style={{
                  backgroundColor: style.bgColor,
                  color: style.iconColor,
                }}
              >
                {style.label}
              </span>
            </div>
            <p className='text-sm text-gray-600 truncate'>
              {guardian.contactInfo}
            </p>
          </div>

          {/* Remove button */}
          <motion.button
            onClick={onRemove}
            className='w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 opacity-70 hover:opacity-100'
            style={{
              backgroundColor: MODERN_COLORS.semantic.error + '10',
              color: MODERN_COLORS.semantic.error,
            }}
            whileHover={{
              scale: 1.1,
              backgroundColor: MODERN_COLORS.semantic.error + '20',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className='w-4 h-4' />
          </motion.button>
        </div>

        {/* Hover border effect */}
        <motion.div
          className='absolute inset-0 rounded-xl pointer-events-none'
          style={{
            background: `linear-gradient(135deg, ${style.iconColor}20 0%, transparent 100%)`,
            opacity: 0,
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </motion.div>
  );
};
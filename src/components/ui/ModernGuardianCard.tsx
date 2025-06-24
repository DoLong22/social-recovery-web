import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Wallet, Trash2 } from 'lucide-react';
import { GuardianType } from '../../api/guardian';
import { VIBRANT_COLORS, VIBRANT_GRADIENTS, VIBRANT_SHADOWS } from '../../constants/vibrant-design-system';

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
          gradient: VIBRANT_GRADIENTS.emailType,
          bgColor: 'rgba(0, 163, 255, 0.1)',
          iconColor: VIBRANT_COLORS.electricBlue,
          label: 'Email Guardian',
          shadow: VIBRANT_SHADOWS.blueGlow,
        };
      case GuardianType.PHONE:
        return {
          icon: Phone,
          gradient: VIBRANT_GRADIENTS.phoneType,
          bgColor: 'rgba(0, 230, 118, 0.1)',
          iconColor: VIBRANT_COLORS.vibrantEmerald,
          label: 'Phone Guardian',
          shadow: VIBRANT_SHADOWS.greenGlow,
        };
      case GuardianType.WALLET:
        return {
          icon: Wallet,
          gradient: VIBRANT_GRADIENTS.walletType,
          bgColor: 'rgba(255, 127, 0, 0.1)',
          iconColor: VIBRANT_COLORS.radiantOrange,
          label: 'Wallet Guardian',
          shadow: VIBRANT_SHADOWS.orangeGlow,
        };
      default:
        return {
          icon: Mail,
          gradient: VIBRANT_GRADIENTS.emailType,
          bgColor: 'rgba(0, 163, 255, 0.1)',
          iconColor: VIBRANT_COLORS.electricBlue,
          label: 'Guardian',
          shadow: VIBRANT_SHADOWS.blueGlow,
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
        className='bg-white rounded-xl border-2 border-gray-100 p-4 transition-all duration-300'
        style={{ boxShadow: VIBRANT_SHADOWS.cardFloat }}
        whileHover={{
          boxShadow: style.shadow,
          scale: 1.02,
          borderColor: style.iconColor,
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
            className='w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300'
            style={{
              backgroundColor: VIBRANT_COLORS.error.light,
              color: VIBRANT_COLORS.vibrantScarlet,
            }}
            whileHover={{
              scale: 1.1,
              backgroundColor: VIBRANT_COLORS.vibrantScarlet,
              color: VIBRANT_COLORS.pureWhite,
              boxShadow: '0 4px 15px rgba(255, 77, 77, 0.4)',
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
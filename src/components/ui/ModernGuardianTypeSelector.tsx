import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Wallet, Smartphone, Printer, Building2, ChevronDown } from 'lucide-react';
import { GuardianType } from '../../api/guardian';
import { MODERN_COLORS } from '../../constants/modern-design-system';
import { VIBRANT_COLORS, VIBRANT_GRADIENTS, VIBRANT_SHADOWS } from '../../constants/vibrant-design-system';

interface GuardianTypeOption {
  value: GuardianType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  gradient: string;
  iconColor: string;
  bgColor: string;
}

interface ModernGuardianTypeSelectorProps {
  selectedType: GuardianType;
  onTypeChange: (type: GuardianType) => void;
  className?: string;
}

const GUARDIAN_TYPES: GuardianTypeOption[] = [
  {
    value: GuardianType.EMAIL,
    label: 'Email',
    icon: Mail,
    description: 'Send recovery link via email',
    gradient: VIBRANT_GRADIENTS.emailType,
    iconColor: VIBRANT_COLORS.electricBlue,
    bgColor: 'rgba(0, 163, 255, 0.1)',
  },
  {
    value: GuardianType.PHONE,
    label: 'Phone',
    icon: Phone,
    description: 'Send SMS verification code',
    gradient: VIBRANT_GRADIENTS.phoneType,
    iconColor: VIBRANT_COLORS.vibrantEmerald,
    bgColor: 'rgba(0, 230, 118, 0.1)',
  },
  {
    value: GuardianType.WALLET,
    label: 'Wallet',
    icon: Wallet,
    description: 'Connect with wallet address',
    gradient: VIBRANT_GRADIENTS.walletType,
    iconColor: VIBRANT_COLORS.radiantOrange,
    bgColor: 'rgba(255, 127, 0, 0.1)',
  },
];

const ADVANCED_TYPES: GuardianTypeOption[] = [
  {
    value: 'hardware' as GuardianType,
    label: 'Hardware',
    icon: Smartphone,
    description: 'Hardware security key',
    gradient: 'linear-gradient(135deg, #FF9900 0%, #CC7A00 100%)',
    iconColor: MODERN_COLORS.accent.orange[600],
    bgColor: MODERN_COLORS.accent.orange[50],
  },
  {
    value: 'dao' as GuardianType,
    label: 'DAO',
    icon: Building2,
    description: 'Decentralized organization',
    gradient: 'linear-gradient(135deg, #8E44AD 0%, #7236A6 100%)',
    iconColor: MODERN_COLORS.accent.purple[600],
    bgColor: MODERN_COLORS.accent.purple[50],
  },
  {
    value: 'print' as GuardianType,
    label: 'Print',
    icon: Printer,
    description: 'Physical paper backup',
    gradient: 'linear-gradient(135deg, #666666 0%, #333333 100%)',
    iconColor: MODERN_COLORS.neutral[600],
    bgColor: MODERN_COLORS.neutral[100],
  },
];

export const ModernGuardianTypeSelector: React.FC<ModernGuardianTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  className = '',
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);


  const TypeCard: React.FC<{ option: GuardianTypeOption; isSelected: boolean }> = ({
    option,
    isSelected,
  }) => {
    const Icon = option.icon;

    return (
      <motion.button
        type="button"
        onClick={() => onTypeChange(option.value)}
        className={`relative w-full p-4 rounded-xl border-2 transition-all duration-200 ${
          isSelected
            ? 'border-current'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        style={{
          background: isSelected
            ? option.bgColor
            : 'rgba(255, 255, 255, 0.7)',
          color: isSelected ? option.iconColor : VIBRANT_COLORS.darkCarbon,
          boxShadow: isSelected 
            ? option.value === GuardianType.EMAIL ? VIBRANT_SHADOWS.blueGlow 
              : option.value === GuardianType.PHONE ? VIBRANT_SHADOWS.greenGlow
              : VIBRANT_SHADOWS.orangeGlow
            : 'none',
        }}
        whileHover={{
          scale: 1.02,
          boxShadow: VIBRANT_SHADOWS.cardHover,
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Gradient overlay for selected state */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-xl opacity-10"
            style={{ background: option.gradient }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 0.2 }}
          />
        )}

        <div className="relative flex items-center gap-3">
          {/* Icon with gradient background when selected */}
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
              isSelected ? 'scale-110' : ''
            }`}
            style={{
              background: isSelected ? option.gradient : option.bgColor,
            }}
          >
            <Icon
              className={`w-6 h-6 ${
                isSelected ? 'text-white' : 'text-current'
              }`}
            />
          </div>

          {/* Label and description */}
          <div className="flex-1 text-left">
            <p className="font-semibold text-base">{option.label}</p>
            <p className="text-sm opacity-75">{option.description}</p>
          </div>

          {/* Selection indicator */}
          {isSelected && (
            <motion.div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: option.gradient }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Basic Types */}
      <div className="space-y-2">
        {GUARDIAN_TYPES.map((option) => (
          <TypeCard
            key={option.value}
            option={option}
            isSelected={selectedType === option.value}
          />
        ))}
      </div>

      {/* Advanced Types Toggle */}
      <motion.button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-lg transition-colors"
        style={{
          color: MODERN_COLORS.primary[600],
          background: MODERN_COLORS.primary[50],
        }}
        whileHover={{
          background: MODERN_COLORS.primary[100],
        }}
      >
        <span>Advanced options</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            showAdvanced ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      {/* Advanced Types */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 overflow-hidden"
          >
            {ADVANCED_TYPES.map((option) => (
              <TypeCard
                key={option.value}
                option={option}
                isSelected={selectedType === option.value}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
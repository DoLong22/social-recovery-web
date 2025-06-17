import React from 'react';
import { motion } from 'framer-motion';
import { GuardianType } from '../../api/guardian';

interface GuardianTypeChipProps {
  type: GuardianType;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const GUARDIAN_TYPE_CONFIG: Record<GuardianType, { 
  icon: string; 
  label: string; 
  description: string;
  color: string;
  bgColor: string;
}> = {
  [GuardianType.EMAIL]: {
    icon: '📧',
    label: 'Email',
    description: 'Fast & Easy',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50'
  },
  [GuardianType.PHONE]: {
    icon: '📱',
    label: 'Phone',
    description: 'SMS Verified',
    color: 'from-green-400 to-green-600',
    bgColor: 'bg-green-50'
  },
  [GuardianType.WALLET]: {
    icon: '🔐',
    label: 'Wallet',
    description: 'Most Secure',
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-50'
  },
  [GuardianType.HARDWARE]: {
    icon: '🔑',
    label: 'Hardware',
    description: 'Hardware Key',
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-50'
  },
  [GuardianType.ORGANIZATION]: {
    icon: '🏢',
    label: 'Organization',
    description: 'Enterprise',
    color: 'from-indigo-400 to-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  [GuardianType.PRINT]: {
    icon: '🖨️',
    label: 'Print',
    description: 'Paper Backup',
    color: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-50'
  }
};

export const GuardianTypeChip: React.FC<GuardianTypeChipProps> = ({
  type,
  isSelected,
  onClick,
  disabled = false
}) => {
  const config = GUARDIAN_TYPE_CONFIG[type];
  
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.98 }}
      className={`
        min-w-[96px] h-12 px-4 rounded-xl border-2 transition-all duration-200
        flex items-center justify-center space-x-2
        ${isSelected 
          ? 'bg-blue-500 border-blue-500 text-white' 
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span className="text-xl">{config.icon}</span>
      <span className="font-medium">{config.label}</span>
    </motion.button>
  );
};

interface GuardianTypeSelectorProps {
  selectedType: GuardianType;
  onTypeSelect: (type: GuardianType) => void;
  disabled?: boolean;
  className?: string;
}

export const GuardianTypeSelector: React.FC<GuardianTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  disabled = false,
  className = ''
}) => {
  // Only show basic guardian types in UI
  const basicTypes = [GuardianType.EMAIL, GuardianType.PHONE, GuardianType.WALLET];
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {basicTypes.map((type) => (
        <GuardianTypeChip
          key={type}
          type={type}
          isSelected={selectedType === type}
          onClick={() => onTypeSelect(type)}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
import React from 'react';
import { motion } from 'framer-motion';
import { GuardianType } from '../../api/guardian';

interface GuardianCardProps {
  name: string;
  type: GuardianType;
  contactInfo: string;
  onRemove?: () => void;
  index?: number;
}

const GUARDIAN_TYPE_CONFIG: Record<GuardianType, { icon: string; label: string }> = {
  [GuardianType.EMAIL]: { icon: '📧', label: 'Email' },
  [GuardianType.PHONE]: { icon: '📱', label: 'Phone' },
  [GuardianType.WALLET]: { icon: '🔐', label: 'Wallet' },
  [GuardianType.HARDWARE]: { icon: '🔑', label: 'Hardware' },
  [GuardianType.ORGANIZATION]: { icon: '🏢', label: 'Organization' },
  [GuardianType.PRINT]: { icon: '🖨️', label: 'Print' }
};

export const GuardianCard: React.FC<GuardianCardProps> = ({
  name,
  type,
  contactInfo,
  onRemove,
  index = 0
}) => {
  const config = GUARDIAN_TYPE_CONFIG[type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center p-3 bg-gray-50 rounded-xl"
    >
      <div className="flex-1 flex items-center space-x-3">
        <span className="text-2xl">{config.icon}</span>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">{contactInfo}</p>
        </div>
      </div>
      
      {onRemove && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
};
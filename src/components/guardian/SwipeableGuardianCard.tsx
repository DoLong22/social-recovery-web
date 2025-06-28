import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { Mail, Phone, Wallet, Key, Building2, Printer } from 'lucide-react';
import { GuardianType } from '../../api/guardian';
import { Button } from '../ui/Button';
import { VIBRANT_GRADIENTS } from '../../constants/vibrant-design-system';

interface SwipeableGuardianCardProps {
  id: string;
  name: string;
  type: GuardianType;
  contactInfo: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  healthScore?: number;
  lastActive?: string;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'EXPIRED';
  onReplace: () => void;
  onRemove: () => void;
  onVerify: () => void;
  onClick: () => void;
}

const GUARDIAN_TYPE_CONFIG = {
  [GuardianType.EMAIL]: { 
    icon: Mail,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    gradient: VIBRANT_GRADIENTS.emailType
  },
  [GuardianType.PHONE]: { 
    icon: Phone,
    bgColor: 'bg-green-100', 
    iconColor: 'text-green-600',
    gradient: VIBRANT_GRADIENTS.phoneType
  },
  [GuardianType.WALLET]: { 
    icon: Wallet,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    gradient: VIBRANT_GRADIENTS.walletType
  },
  [GuardianType.HARDWARE]: { 
    icon: Key,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    gradient: 'linear-gradient(135deg, #FF9900 0%, #CC7A00 100%)'
  },
  [GuardianType.ORGANIZATION]: { 
    icon: Building2,
    bgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    gradient: 'linear-gradient(135deg, #5E00FF 0%, #3C00CC 100%)'
  },
  [GuardianType.PRINT]: { 
    icon: Printer,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
    gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
  }
};

export const SwipeableGuardianCard: React.FC<SwipeableGuardianCardProps> = ({
  name,
  type,
  contactInfo,
  status,
  healthScore,
  lastActive,
  verificationStatus,
  onReplace,
  onRemove,
  onVerify,
  onClick
}) => {
  const [, setShowActions] = useState(false);
  const controls = useAnimation();
  
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setShowActions(true);
      controls.start({ x: -160 });
    },
    onSwipedRight: () => {
      setShowActions(false);
      controls.start({ x: 0 });
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50
  });

  const getHealthStatusColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthStatusIcon = (score?: number) => {
    if (!score) return '⏸️';
    if (score >= 80) return '✅';
    if (score >= 50) return '⚠️';
    return '❌';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl" {...handlers}>
      {/* Action buttons */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onReplace}
          className="w-20 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center"
        >
          Replace
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="w-20 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center"
        >
          Remove
        </motion.button>
      </div>

      {/* Card content */}
      <motion.div
        animate={controls}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative bg-white rounded-2xl p-4 cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              GUARDIAN_TYPE_CONFIG[type]?.bgColor || 'bg-gray-100'
            }`}>
              {GUARDIAN_TYPE_CONFIG[type] ? (
                React.createElement(GUARDIAN_TYPE_CONFIG[type].icon, {
                  className: `w-5 h-5 ${GUARDIAN_TYPE_CONFIG[type].iconColor}`
                })
              ) : (
                <Wallet className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{name}</p>
              <p className="text-sm text-gray-600">{contactInfo}</p>
              <p className="text-xs text-gray-500">
                Last active: {lastActive || 'Never'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-2xl ${getHealthStatusColor(healthScore)}`}>
              {getHealthStatusIcon(healthScore)}
            </span>
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusBadgeClass(status)}`}>
              {status}
            </span>
          </div>
        </div>
        
        {verificationStatus === 'UNVERIFIED' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onVerify();
              }}
            >
              Verify Guardian
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
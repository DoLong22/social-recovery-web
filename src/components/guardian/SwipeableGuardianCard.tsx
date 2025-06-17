import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { GuardianType } from '../../api/guardian';
import { Button } from '../ui/Button';

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
  [GuardianType.EMAIL]: { icon: '📧' },
  [GuardianType.PHONE]: { icon: '📱' },
  [GuardianType.WALLET]: { icon: '🔐' },
  [GuardianType.HARDWARE]: { icon: '🔑' },
  [GuardianType.ORGANIZATION]: { icon: '🏢' },
  [GuardianType.PRINT]: { icon: '🖨️' }
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
        className="relative bg-white border border-gray-200 rounded-2xl p-4 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xl">
                {GUARDIAN_TYPE_CONFIG[type]?.icon || '👤'}
              </span>
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
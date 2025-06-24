import React from 'react';
import { motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import { VIBRANT_COLORS, VIBRANT_GRADIENTS, VIBRANT_SHADOWS } from '../../constants/vibrant-design-system';

interface GuardianProgressSlotsProps {
  current: number;
  minimum: number;
  maximum?: number;
  className?: string;
}

export const GuardianProgressSlots: React.FC<GuardianProgressSlotsProps> = ({
  current,
  minimum,
  maximum = 5,
  className = ''
}) => {

  return (
    <div className={`${className}`}>
      {/* Visual guardian slots - main progress indicator */}
      <div className="flex items-center gap-2 mb-4 justify-center">
        {Array.from({ length: Math.max(minimum, current) }, (_, index) => {
          const isFilled = index < current;
          const isRequired = index < minimum;
          
          return (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="relative"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 relative overflow-hidden"
                style={{
                  background: isFilled 
                    ? VIBRANT_GRADIENTS.successGradient
                    : isRequired 
                      ? 'rgba(0, 163, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.7)',
                  border: isFilled 
                    ? 'none' 
                    : isRequired 
                      ? `2px solid ${VIBRANT_COLORS.electricBlue}40`
                      : '2px dashed #E5E7EB',
                  boxShadow: isFilled ? VIBRANT_SHADOWS.cardFloat : 'none',
                }}
              >
                {isFilled ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span 
                    className="text-xs font-medium"
                    style={{ 
                      color: isRequired ? VIBRANT_COLORS.electricBlue : '#9CA3AF' 
                    }}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
        
        {/* Add more guardian indicator */}
        {current >= minimum && current < maximum && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center transition-all duration-300 hover:border-solid"
            style={{ 
              borderColor: VIBRANT_COLORS.electricBlue + '60',
              backgroundColor: 'rgba(0, 163, 255, 0.05)'
            }}
          >
            <Plus className="w-4 h-4" style={{ color: VIBRANT_COLORS.electricBlue }} />
          </motion.div>
        )}
      </div>

      {/* Simple status text */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm font-medium" style={{ color: VIBRANT_COLORS.darkCarbon }}>
          {current} of {minimum} minimum guardians
        </p>
      </motion.div>
    </div>
  );
};
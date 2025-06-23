import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

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
  const slots = Array.from({ length: Math.max(minimum, current) }, (_, i) => i);
  const isFilled = (index: number) => index < current;
  const isRequired = (index: number) => index < minimum;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Visual slots */}
      <div className="flex items-center gap-2 justify-center">
        {slots.map((index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
          >
            <div
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                ${isFilled(index) 
                  ? 'bg-primary-500 text-white shadow-sm' 
                  : isRequired(index)
                    ? 'bg-gray-200 border-2 border-gray-300'
                    : 'bg-gray-100 border-2 border-dashed border-gray-300'
                }
              `}
            >
              {isFilled(index) ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium text-gray-500">
                  {index + 1}
                </span>
              )}
            </div>
            {isRequired(index) && !isFilled(index) && (
              <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
                <span className="text-xs text-gray-500">Required</span>
              </div>
            )}
          </motion.div>
        ))}
        
        {/* Add more button if under maximum */}
        {current >= minimum && current < maximum && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center"
          >
            <span className="text-xl text-gray-400">+</span>
          </motion.div>
        )}
      </div>
      
      {/* Progress text */}
      <div className="text-center mt-6">
        <p className="text-sm font-medium text-gray-900">
          {current} of {minimum} minimum guardians
        </p>
        {current >= minimum && (
          <p className="text-xs text-gray-500 mt-1">
            You can add up to {maximum} guardians for extra security
          </p>
        )}
      </div>
    </div>
  );
};
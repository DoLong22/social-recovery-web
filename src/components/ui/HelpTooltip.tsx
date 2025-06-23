import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpTooltipProps {
  content: string;
  title?: string;
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  content, 
  title,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4 text-gray-400" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close tooltip */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Tooltip content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
            >
              {title && (
                <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
              )}
              <p className="text-sm text-gray-600 leading-relaxed">
                {content}
              </p>
              
              {/* Arrow pointing to help icon */}
              <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
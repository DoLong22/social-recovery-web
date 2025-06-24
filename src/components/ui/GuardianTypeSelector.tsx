import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Wallet, HardDrive, Building2, Printer, ChevronDown } from 'lucide-react';
import { GuardianType } from '../../api/guardian';

interface GuardianTypeSelectorProps {
  selectedType: GuardianType;
  onTypeChange: (type: GuardianType) => void;
  className?: string;
}

const GUARDIAN_TYPES = [
  {
    value: GuardianType.EMAIL,
    label: 'Email',
    icon: Mail,
    description: 'Send via email address',
    color: 'blue'
  },
  {
    value: GuardianType.PHONE,
    label: 'Phone',
    icon: Phone,
    description: 'Send via SMS',
    color: 'green'
  },
  {
    value: GuardianType.WALLET,
    label: 'Wallet Address',
    icon: Wallet,
    description: 'Blockchain wallet',
    color: 'purple'
  }
];

const ADVANCED_GUARDIAN_TYPES = [
  {
    value: 'HARDWARE' as GuardianType,
    label: 'Hardware Device',
    icon: HardDrive,
    description: 'Physical security key',
    color: 'orange'
  },
  {
    value: 'DAO' as GuardianType,
    label: 'Organization',
    icon: Building2,
    description: 'DAO or company',
    color: 'indigo'
  },
  {
    value: 'PRINT' as GuardianType,
    label: 'Print Backup',
    icon: Printer,
    description: 'Physical paper backup',
    color: 'gray'
  }
];

export const GuardianTypeSelector: React.FC<GuardianTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  className = ''
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const selectedTypeInfo = [...GUARDIAN_TYPES, ...ADVANCED_GUARDIAN_TYPES].find(t => t.value === selectedType);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main types */}
      <div className="flex gap-2">
        {GUARDIAN_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.value;
          
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onTypeChange(type.value)}
              className={`
                flex-1 flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all
                ${isSelected 
                  ? `border-${type.color}-500 bg-${type.color}-50` 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <Icon 
                className={`w-5 h-5 ${isSelected ? `text-${type.color}-600` : 'text-gray-500'}`} 
              />
              <span className={`text-sm font-medium ${isSelected ? `text-${type.color}-700` : 'text-gray-700'}`}>
                {type.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* More options button */}
      {!showAdvanced && (
        <button
          type="button"
          onClick={() => setShowAdvanced(true)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>More guardian types</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {/* Advanced types */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">Advanced Options</p>
              <div className="grid grid-cols-3 gap-2">
                {ADVANCED_GUARDIAN_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.value;
                  
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => onTypeChange(type.value)}
                      className={`
                        flex flex-col items-center gap-1 px-3 py-2 rounded-lg border-2 transition-all
                        ${isSelected 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }
                      `}
                    >
                      <Icon 
                        className={`w-4 h-4 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} 
                      />
                      <span className={`text-xs font-medium ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected type description */}
      {selectedTypeInfo && (
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-600">
            {selectedTypeInfo.description}
          </p>
        </div>
      )}
    </div>
  );
};
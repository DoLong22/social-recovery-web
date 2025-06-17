import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThresholdSelectorProps {
  totalGuardians: number;
  threshold: number;
  onThresholdChange: (threshold: number) => void;
  className?: string;
}

export const ThresholdSelector: React.FC<ThresholdSelectorProps> = ({
  totalGuardians,
  threshold,
  onThresholdChange,
  className = ''
}) => {
  const [showTechnical, setShowTechnical] = useState(false);

  // Smart recommendations based on total guardians
  const getRecommendations = (total: number) => {
    if (total === 3) return [
      { value: 2, label: 'Recommended', description: 'Any 2 friends can help', icon: '👥', isRecommended: true },
      { value: 3, label: 'Maximum Security', description: 'All friends must agree', icon: '🔒', isRecommended: false }
    ];
    
    if (total === 4) return [
      { value: 2, label: 'Easy Recovery', description: 'Any 2 friends can help', icon: '⚡', isRecommended: false },
      { value: 3, label: 'Recommended', description: 'Need 3 out of 4 friends', icon: '👥', isRecommended: true },
      { value: 4, label: 'Maximum Security', description: 'All friends must agree', icon: '🔒', isRecommended: false }
    ];

    if (total === 5) return [
      { value: 3, label: 'Recommended', description: 'Need 3 out of 5 friends', icon: '👥', isRecommended: true },
      { value: 4, label: 'High Security', description: 'Need 4 out of 5 friends', icon: '🔒', isRecommended: false },
      { value: 5, label: 'Maximum Security', description: 'All friends must agree', icon: '🔐', isRecommended: false }
    ];

    // For 6+ guardians
    const recommended = Math.ceil(total * 0.6);
    return [
      { value: recommended - 1, label: 'Easy Recovery', description: `Need ${recommended - 1} friends`, icon: '⚡', isRecommended: false },
      { value: recommended, label: 'Recommended', description: `Need ${recommended} out of ${total} friends`, icon: '👥', isRecommended: true },
      { value: Math.min(total, recommended + 1), label: 'High Security', description: `Need ${Math.min(total, recommended + 1)} friends`, icon: '🔒', isRecommended: false }
    ];
  };

  const recommendations = getRecommendations(totalGuardians);
  const selectedRec = recommendations.find(r => r.value === threshold);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          How many friends should help you?
        </h3>
        <p className="text-gray-600 text-sm">
          Choose how many guardians you need to recover your wallet
        </p>
      </div>

      {/* Current Selection Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-100">
        <div className="text-4xl mb-2">{selectedRec?.icon || '👥'}</div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {threshold} out of {totalGuardians}
        </div>
        <div className="text-sm font-medium text-blue-700 mb-2">
          {selectedRec?.label || 'Custom'}
        </div>
        <div className="text-sm text-gray-600">
          {selectedRec?.description || `Need ${threshold} friends to help recover`}
        </div>
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700 mb-3">Choose your security level:</div>
        {recommendations.map((rec) => (
          <motion.button
            key={rec.value}
            onClick={() => onThresholdChange(rec.value)}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              threshold === rec.value
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{rec.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{rec.label}</span>
                  {rec.isRecommended && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      ⭐ Best Choice
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">{rec.description}</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                threshold === rec.value
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {threshold === rec.value && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Example Scenario */}
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <div className="flex items-start gap-3">
          <div className="text-yellow-600 text-xl">💡</div>
          <div>
            <div className="font-medium text-yellow-900 mb-1">Example Recovery</div>
            <div className="text-sm text-yellow-800">
              If you choose "{selectedRec?.label}": Even if {totalGuardians - threshold} 
              {totalGuardians - threshold === 1 ? ' friend is' : ' friends are'} unavailable, 
              you can still recover your wallet with the remaining {threshold} friends.
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details (Collapsible) */}
      <div>
        <button
          onClick={() => setShowTechnical(!showTechnical)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span>🔧 Technical details</span>
          <motion.div
            animate={{ rotate: showTechnical ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ↓
          </motion.div>
        </button>
        
        <AnimatePresence>
          {showTechnical && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-gray-50 rounded-lg border text-sm text-gray-700"
            >
              <div className="space-y-2">
                <div><strong>Technology:</strong> Shamir's Secret Sharing (SSS)</div>
                <div><strong>How it works:</strong> Your wallet key is split into {totalGuardians} pieces. Any {threshold} pieces can recreate the original key.</div>
                <div><strong>Security:</strong> Even if {totalGuardians - threshold} pieces are compromised, your wallet remains safe.</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
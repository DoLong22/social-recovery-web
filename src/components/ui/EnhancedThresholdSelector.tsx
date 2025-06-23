import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, Info, Users, Lock, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';
import { EXTERNAL_LINKS } from '../../constants/links';
import { MODERN_COLORS, GRADIENTS, SHADOWS, MODERN_TYPOGRAPHY } from '../../constants/modern-design-system';

interface ThresholdOption {
  id: string;
  name: string;
  description: string;
  threshold: number;
  isRecommended?: boolean;
  icon: React.ReactNode;
  pros: string[];
  cons: string[];
}

interface EnhancedThresholdSelectorProps {
  totalGuardians: number;
  threshold: number;
  onThresholdChange: (threshold: number) => void;
  className?: string;
}

export const EnhancedThresholdSelector: React.FC<EnhancedThresholdSelectorProps> = ({
  totalGuardians,
  threshold,
  onThresholdChange,
  className = ''
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customThreshold, setCustomThreshold] = useState(threshold);

  // Calculate recommended threshold (majority)
  const recommendedThreshold = Math.ceil(totalGuardians / 2);
  const maximumThreshold = totalGuardians;

  const thresholdOptions: ThresholdOption[] = [
    {
      id: 'recommended',
      name: 'Recommended',
      description: `Any ${recommendedThreshold} friends can help`,
      threshold: recommendedThreshold,
      isRecommended: true,
      icon: <Shield className="w-5 h-5" />,
      pros: [
        'Balanced security and accessibility',
        `Recovery works even if ${totalGuardians - recommendedThreshold} guardian${totalGuardians - recommendedThreshold > 1 ? 's are' : ' is'} unavailable`,
        'Protects against collusion'
      ],
      cons: [
        `${recommendedThreshold} guardians could recover without you`
      ]
    },
    {
      id: 'maximum',
      name: 'Maximum Security',
      description: 'All friends must agree',
      threshold: maximumThreshold,
      icon: <Lock className="w-5 h-5" />,
      pros: [
        'Highest security level',
        'No group can recover without full consensus',
        'Maximum protection against collusion'
      ],
      cons: [
        'Recovery fails if ANY guardian is unavailable',
        'Higher risk of permanent lock-out'
      ]
    }
  ];

  // Add custom option if current threshold doesn't match presets
  const isCustomThreshold = threshold !== recommendedThreshold && threshold !== maximumThreshold;
  
  const selectedOption = thresholdOptions.find(opt => opt.threshold === threshold);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with help */}
      <div className="flex items-center justify-end mb-6">
        <HelpTooltip
          title="About Recovery Threshold"
          content="The threshold determines how many of your guardians need to cooperate to help you recover your wallet. Choose between security (higher threshold) and accessibility (lower threshold)."
        />
      </div>

      {/* Visual Threshold Representation */}
      <motion.div 
        className="rounded-2xl p-6 mb-6"
        style={{
          background: GRADIENTS.radialBackground,
          boxShadow: SHADOWS.cardSoft,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ThresholdVisualizer
          total={totalGuardians}
          threshold={threshold}
        />
      </motion.div>

      {/* Current Selection Display */}
      <motion.div
        layoutId="selected-threshold"
        className="rounded-2xl p-6 mb-6"
        style={{
          background: `linear-gradient(135deg, ${MODERN_COLORS.primary[50]} 0%, ${MODERN_COLORS.primary[100]} 100%)`,
          border: `2px solid ${MODERN_COLORS.primary[500]}`,
          boxShadow: SHADOWS.cardMedium,
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div 
                className="text-3xl font-bold"
                style={{ 
                  color: MODERN_COLORS.primary[700],
                  background: GRADIENTS.primaryButton,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                whileHover={{ scale: 1.05 }}
              >
                {threshold} out of {totalGuardians}
              </motion.div>
              {selectedOption?.isRecommended && (
                <motion.span 
                  className="px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1"
                  style={{
                    backgroundColor: MODERN_COLORS.accent.green[100],
                    color: MODERN_COLORS.accent.green[700],
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <CheckCircle className="w-3 h-3" />
                  Best Choice
                </motion.span>
              )}
            </div>
            <p 
              className="font-medium"
              style={{ color: MODERN_COLORS.neutral[700] }}
            >
              {selectedOption?.description || `Any ${threshold} guardians can help recover your wallet`}
            </p>
          </div>
          {selectedOption?.icon && (
            <motion.div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: GRADIENTS.primaryButton }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-white">
                {selectedOption.icon}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Security Level Options */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Choose your security level:</h3>
        
        {thresholdOptions.map((option) => (
          <ThresholdOptionCard
            key={option.id}
            option={option}
            isSelected={threshold === option.threshold}
            onSelect={() => {
              onThresholdChange(option.threshold);
              setShowCustomInput(false);
            }}
          />
        ))}

        {/* Custom Option */}
        {(isCustomThreshold || showCustomInput) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-2 border-gray-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={isCustomThreshold}
                  onChange={() => onThresholdChange(customThreshold)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium">Custom Threshold</span>
              </label>
            </div>
            <div className="ml-7 space-y-3">
              <input
                type="number"
                min={1}
                max={totalGuardians}
                value={customThreshold}
                onChange={(e) => {
                  const value = Math.max(1, Math.min(totalGuardians, parseInt(e.target.value) || 1));
                  setCustomThreshold(value);
                  onThresholdChange(value);
                }}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-600">
                Choose any number between 1 and {totalGuardians}
              </p>
            </div>
          </motion.div>
        )}

        {/* Add Custom Option Button */}
        {!showCustomInput && !isCustomThreshold && (
          <button
            onClick={() => setShowCustomInput(true)}
            className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            + Add custom threshold
          </button>
        )}
      </div>

      {/* Dynamic Information Box */}
      <DynamicInfoBox
        threshold={threshold}
        totalGuardians={totalGuardians}
        isMaximum={threshold === totalGuardians}
      />

      {/* Technical Details Link */}
      <div className="text-center">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="text-sm text-blue-600 hover:text-blue-700 underline"
        >
          {showTechnicalDetails ? 'Hide' : 'Show'} technical details
        </button>
      </div>

      {/* Technical Details Content */}
      {showTechnicalDetails && (
        <TechnicalDetails
          threshold={threshold}
          totalGuardians={totalGuardians}
        />
      )}
    </div>
  );
};

// Threshold Option Card Component
const ThresholdOptionCard: React.FC<{
  option: ThresholdOption;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ option, isSelected, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="relative border-2 rounded-2xl p-5 cursor-pointer transition-all"
      style={{
        borderColor: isSelected ? MODERN_COLORS.primary[500] : MODERN_COLORS.neutral[200],
        backgroundColor: isSelected ? MODERN_COLORS.primary[50] : MODERN_COLORS.background.primary,
        boxShadow: isSelected ? SHADOWS.cardMedium : SHADOWS.cardSoft,
      }}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          checked={isSelected}
          onChange={onSelect}
          className="mt-1 w-4 h-4 text-blue-600"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: isSelected ? GRADIENTS.primaryButton : MODERN_COLORS.neutral[100],
              }}
              whileHover={{ scale: 1.1 }}
            >
              <div className={isSelected ? 'text-white' : 'text-gray-600'}>
                {option.icon}
              </div>
            </motion.div>
            <div className="flex-1">
              <h4 
                className="font-semibold text-lg"
                style={{ color: MODERN_COLORS.neutral[900] }}
              >
                {option.name}
              </h4>
              {option.isRecommended && (
                <motion.span 
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full mt-1"
                  style={{
                    backgroundColor: MODERN_COLORS.accent.green[100],
                    color: MODERN_COLORS.accent.green[700],
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CheckCircle className="w-3 h-3" />
                  Best Choice
                </motion.span>
              )}
            </div>
          </div>
          <p 
            className="text-sm mb-3 ml-13"
            style={{ color: MODERN_COLORS.neutral[600] }}
          >
            {option.description}
          </p>
          
          {/* Pros and Cons */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <motion.div
              className="p-3 rounded-lg"
              style={{ backgroundColor: MODERN_COLORS.accent.green[50] }}
              whileHover={{ scale: 1.02 }}
            >
              <p 
                className="text-xs font-semibold mb-2 flex items-center gap-1"
                style={{ color: MODERN_COLORS.accent.green[700] }}
              >
                <CheckCircle className="w-3 h-3" />
                Pros:
              </p>
              <ul className="text-xs space-y-1" style={{ color: MODERN_COLORS.neutral[600] }}>
                {option.pros.map((pro, i) => (
                  <motion.li 
                    key={i} 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span 
                      className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: MODERN_COLORS.accent.green[500] }}
                    />
                    <span>{pro}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              className="p-3 rounded-lg"
              style={{ backgroundColor: MODERN_COLORS.semantic.error + '10' }}
              whileHover={{ scale: 1.02 }}
            >
              <p 
                className="text-xs font-semibold mb-2 flex items-center gap-1"
                style={{ color: MODERN_COLORS.semantic.error }}
              >
                <AlertTriangle className="w-3 h-3" />
                Cons:
              </p>
              <ul className="text-xs space-y-1" style={{ color: MODERN_COLORS.neutral[600] }}>
                {option.cons.map((con, i) => (
                  <motion.li 
                    key={i} 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span 
                      className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: MODERN_COLORS.semantic.error }}
                    />
                    <span>{con}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
        <div className="text-gray-400">
          {option.icon}
        </div>
      </div>
    </motion.div>
  );
};

// Visual Threshold Representation
const ThresholdVisualizer: React.FC<{
  total: number;
  threshold: number;
}> = ({ total, threshold }) => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${i < threshold 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-500'
              }
            `}
          >
            <Users className="w-6 h-6" />
          </motion.div>
        ))}
      </div>
      <p className="text-sm text-gray-600">
        <span className="font-medium text-blue-600">{threshold}</span> out of{' '}
        <span className="font-medium">{total}</span> guardians needed for recovery
      </p>
    </div>
  );
};

// Dynamic Information Box
const DynamicInfoBox: React.FC<{
  threshold: number;
  totalGuardians: number;
  isMaximum: boolean;
}> = ({ threshold, totalGuardians, isMaximum }) => {
  const unavailableGuardians = totalGuardians - threshold;

  return (
    <motion.div
      key={`info-${threshold}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{
        background: isMaximum 
          ? `linear-gradient(135deg, ${MODERN_COLORS.accent.orange[50]} 0%, ${MODERN_COLORS.accent.orange[100]} 100%)`
          : `linear-gradient(135deg, ${MODERN_COLORS.accent.green[50]} 0%, ${MODERN_COLORS.accent.green[100]} 100%)`,
        border: `1px solid ${isMaximum ? MODERN_COLORS.accent.orange[200] : MODERN_COLORS.accent.green[200]}`,
        boxShadow: SHADOWS.cardSoft,
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex gap-4">
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isMaximum 
              ? GRADIENTS.orangeButton
              : GRADIENTS.greenButton,
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          {isMaximum ? (
            <AlertTriangle className="w-5 h-5 text-white" />
          ) : (
            <CheckCircle className="w-5 h-5 text-white" />
          )}
        </motion.div>
        
        <div className="flex-1">
          {isMaximum ? (
            <>
              <motion.p 
                className="font-bold mb-2 flex items-center gap-2"
                style={{ color: MODERN_COLORS.accent.orange[800] }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <AlertTriangle className="w-4 h-4" />
                Maximum Security Warning
              </motion.p>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: MODERN_COLORS.neutral[700] }}
              >
                Recovery will <strong>fail</strong> if even one guardian is unavailable.
                This provides maximum security but increases the risk of being permanently
                locked out of your wallet.
              </p>
            </>
          ) : (
            <>
              <motion.p 
                className="font-bold mb-2 flex items-center gap-2"
                style={{ color: MODERN_COLORS.accent.green[800] }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <CheckCircle className="w-4 h-4" />
                Flexible Recovery
              </motion.p>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: MODERN_COLORS.neutral[700] }}
              >
                Even if <strong>{unavailableGuardians} guardian{unavailableGuardians !== 1 ? 's are' : ' is'}</strong> unavailable,
                you can still recover your wallet with the remaining <strong>{threshold} guardian{threshold !== 1 ? 's' : ''}</strong>.
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Technical Details Component
const TechnicalDetails: React.FC<{
  threshold: number;
  totalGuardians: number;
}> = ({ threshold, totalGuardians }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="bg-gray-50 rounded-xl p-6 space-y-4"
    >
      <h4 className="font-medium text-gray-900">Technical Details</h4>
      
      <div className="space-y-3 text-sm text-gray-600">
        <div>
          <p className="font-medium text-gray-700 mb-1">How it works:</p>
          <p>
            Your recovery key is split into {totalGuardians} encrypted shares using
            Shamir's Secret Sharing. Any {threshold} shares can be combined to
            reconstruct your original key.
          </p>
        </div>
        
        <div>
          <p className="font-medium text-gray-700 mb-1">Security considerations:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Each guardian only has a piece of your key</li>
            <li>Shares are encrypted and cannot be read by guardians</li>
            <li>No single guardian (or group smaller than {threshold}) can access your wallet</li>
            <li>The threshold cannot be changed after setup</li>
          </ul>
        </div>
        
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <a 
              href={EXTERNAL_LINKS.SHAMIR_SECRET_SHARING}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
            >
              Learn about Shamir's Secret Sharing
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={EXTERNAL_LINKS.GUARDIAN_API_DOCS}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
            >
              Guardian API Documentation
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
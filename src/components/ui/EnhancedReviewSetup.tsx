import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Wallet, Shield, CheckCircle, Info, AlertCircle, ChevronRight, Lock, Sparkles, Send, Eye } from 'lucide-react';
import { GuardianType } from '../../api/guardian';
import { Card } from './Card';
import { ModernButton } from './ModernButton';
import { HelpTooltip } from './HelpTooltip';
import { MODERN_COLORS, GRADIENTS, SHADOWS, MODERN_TYPOGRAPHY } from '../../constants/modern-design-system';

interface Guardian {
  type: GuardianType;
  contactInfo: string;
  name: string;
}

interface EnhancedReviewSetupProps {
  guardians: Guardian[];
  threshold: number;
  onSubmit: () => void;
  onEditSecurity: () => void;
  isSubmitting?: boolean;
}

export const EnhancedReviewSetup: React.FC<EnhancedReviewSetupProps> = ({
  guardians,
  threshold,
  onSubmit,
  onEditSecurity,
  isSubmitting = false
}) => {
  const [showWhatHappensNext, setShowWhatHappensNext] = useState(false);

  // Helper to get guardian type label
  const getGuardianTypeLabel = (type: GuardianType): string => {
    switch (type) {
      case GuardianType.EMAIL:
        return 'Email Guardian';
      case GuardianType.PHONE:
        return 'Phone Guardian';
      case GuardianType.WALLET:
        return 'Wallet Guardian';
      default:
        return 'Guardian';
    }
  };

  // Helper to get guardian icon
  const getGuardianIcon = (type: GuardianType) => {
    switch (type) {
      case GuardianType.EMAIL:
        return <Mail className="w-5 h-5 text-blue-600" />;
      case GuardianType.PHONE:
        return <Phone className="w-5 h-5 text-green-600" />;
      case GuardianType.WALLET:
        return <Wallet className="w-5 h-5 text-purple-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  // Helper to get guardian icon background
  const getGuardianIconBg = (type: GuardianType): string => {
    switch (type) {
      case GuardianType.EMAIL:
        return 'bg-blue-100';
      case GuardianType.PHONE:
        return 'bg-green-100';
      case GuardianType.WALLET:
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Helper to get guardian styling
  const getGuardianStyle = (type: GuardianType) => {
    switch (type) {
      case GuardianType.EMAIL:
        return {
          icon: Mail,
          gradient: 'linear-gradient(135deg, #3A86FF 0%, #2E6FCC 100%)',
          bgColor: MODERN_COLORS.primary[100],
          iconColor: MODERN_COLORS.primary[600],
        };
      case GuardianType.PHONE:
        return {
          icon: Phone,
          gradient: 'linear-gradient(135deg, #3CCF4E 0%, #30A63E 100%)',
          bgColor: MODERN_COLORS.accent.green[100],
          iconColor: MODERN_COLORS.accent.green[600],
        };
      case GuardianType.WALLET:
        return {
          icon: Wallet,
          gradient: 'linear-gradient(135deg, #8E44AD 0%, #7236A6 100%)',
          bgColor: MODERN_COLORS.accent.purple[100],
          iconColor: MODERN_COLORS.accent.purple[600],
        };
      default:
        return {
          icon: Shield,
          gradient: 'linear-gradient(135deg, #3A86FF 0%, #2E6FCC 100%)',
          bgColor: MODERN_COLORS.primary[100],
          iconColor: MODERN_COLORS.primary[600],
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header info with animation */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" style={{ color: MODERN_COLORS.primary[500] }} />
          <p 
            className="text-lg font-semibold"
            style={{ color: MODERN_COLORS.neutral[900] }}
          >
            You're almost done!
          </p>
          <Sparkles className="w-5 h-5" style={{ color: MODERN_COLORS.primary[500] }} />
        </div>
        <p style={{ color: MODERN_COLORS.neutral[600] }}>
          Confirm your guardians before sending invitations
        </p>
      </motion.div>

      {/* Guardian List */}
      <div className="space-y-4">
        <motion.h3 
          className="text-base font-semibold flex items-center gap-2 mb-4"
          style={{ color: MODERN_COLORS.neutral[800] }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Shield className="w-5 h-5" style={{ color: MODERN_COLORS.primary[500] }} />
          Your Guardian Network
        </motion.h3>
        
        {guardians.map((guardian, index) => {
          const style = getGuardianStyle(guardian.type);
          const Icon = style.icon;
          
          return (
            <motion.div
              key={`${guardian.type}-${guardian.contactInfo}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <motion.div
                className="relative bg-white rounded-2xl p-5 border border-gray-200"
                style={{ boxShadow: SHADOWS.cardSoft }}
                whileHover={{ 
                  boxShadow: SHADOWS.cardHover,
                  scale: 1.02,
                }}
              >
                {/* Gradient overlay */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-5"
                  style={{ background: style.gradient }}
                />
                
                <div className="relative flex items-center gap-4">
                  {/* Enhanced icon */}
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                    style={{ background: style.gradient }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                    <div 
                      className="absolute inset-0 rounded-2xl blur-lg opacity-30"
                      style={{ background: style.gradient }}
                    />
                  </motion.div>

                  {/* Guardian info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p 
                        className="font-bold text-lg"
                        style={{ color: MODERN_COLORS.neutral[900] }}
                      >
                        {guardian.name}
                      </p>
                      <motion.span
                        className="px-3 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: style.bgColor,
                          color: style.iconColor,
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        {getGuardianTypeLabel(guardian.type)}
                      </motion.span>
                    </div>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: MODERN_COLORS.neutral[600] }}
                    >
                      {guardian.contactInfo}
                    </p>
                  </div>

                  {/* Status indicator */}
                  <motion.div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: GRADIENTS.greenButton }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
                  >
                    <CheckCircle className="w-5 h-5 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Security Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${MODERN_COLORS.accent.green[50]} 0%, ${MODERN_COLORS.accent.green[100]} 100%)`,
            border: `2px solid ${MODERN_COLORS.accent.green[300]}`,
            boxShadow: SHADOWS.cardMedium,
          }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 20% 20%, ${MODERN_COLORS.accent.green[500]} 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, ${MODERN_COLORS.accent.green[600]} 0%, transparent 50%)`,
              }}
            />
          </div>
          
          <div className="relative flex items-start gap-4">
            <motion.div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: GRADIENTS.greenButton }}
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className="w-6 h-6 text-white" />
            </motion.div>
            
            <div className="flex-1">
              <motion.p 
                className="font-bold text-xl mb-2"
                style={{ color: MODERN_COLORS.accent.green[900] }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {guardians.length} guardians will secure your wallet
              </motion.p>
              
              <motion.p 
                className="text-sm font-medium mb-4"
                style={{ color: MODERN_COLORS.accent.green[800] }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                You'll need at least <strong>{threshold}</strong> guardians to recover access
              </motion.p>
              
              {/* Trust reinforcement message */}
              <motion.div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: MODERN_COLORS.accent.green[200] + '50',
                  border: `1px solid ${MODERN_COLORS.accent.green[300]}`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: GRADIENTS.primaryButton }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Lock className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <p 
                      className="text-xs font-semibold mb-1"
                      style={{ color: MODERN_COLORS.accent.green[800] }}
                    >
                      100% Secure & Private
                    </p>
                    <p 
                      className="text-xs leading-relaxed"
                      style={{ color: MODERN_COLORS.accent.green[700] }}
                    >
                      Guardians only receive encrypted shares, never your actual wallet key
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* What Happens Next */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={() => setShowWhatHappensNext(!showWhatHappensNext)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <Info className="w-4 h-4" />
          <span>What happens next?</span>
          <ChevronRight className={`w-4 h-4 transition-transform ${showWhatHappensNext ? 'rotate-90' : ''}`} />
        </button>
        
        {showWhatHappensNext && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 bg-blue-50 rounded-lg p-4"
          >
            <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-medium">1.</span>
                <span>We'll send an invitation to each guardian via their preferred method</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">2.</span>
                <span>Guardians have 48 hours to accept their invitation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">3.</span>
                <span>You'll receive notifications as guardians accept</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">4.</span>
                <span>Once {threshold} guardians accept, your wallet is secured!</span>
              </li>
            </ol>
            
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-700 flex items-start gap-1">
                <AlertCircle className="w-3 h-3 mt-0.5" />
                If a guardian doesn't accept within 48 hours, you can resend or replace them
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Progress Indicator */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Setup Progress</span>
          <span className="text-sm text-gray-600">Step 3 of 3</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: '66%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5 }}
            className="bg-green-500 h-2 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Ready to send invitations!
        </p>
      </div>

      {/* Action Buttons */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <ModernButton
          onClick={onSubmit}
          loading={isSubmitting}
          fullWidth
          size="lg"
          variant="primary"
          disabled={isSubmitting}
          icon={
            !isSubmitting ? (
              <Send className="w-5 h-5" />
            ) : undefined
          }
        >
          {isSubmitting ? 'Sending Invitations...' : 'Send Invitations'}
        </ModernButton>

        <ModernButton
          variant="ghost"
          onClick={onEditSecurity}
          fullWidth
          disabled={isSubmitting}
          icon={
            <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
          }
          iconPosition="left"
        >
          Edit Setup
        </ModernButton>
      </motion.div>

      {/* Final Trust Message */}
      <div className="text-center text-xs text-gray-500">
        <p>
          By continuing, you agree to our security practices and terms of service
        </p>
      </div>
    </div>
  );
};
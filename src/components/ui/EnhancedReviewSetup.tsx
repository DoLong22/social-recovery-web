import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Wallet, Shield, CheckCircle, Info, AlertCircle, ChevronRight, Lock, Sparkles, Send } from 'lucide-react';
import { GuardianType } from '../../api/guardian';
import { ModernButton } from './ModernButton';
import { MODERN_COLORS, GRADIENTS } from '../../constants/modern-design-system';
import { VIBRANT_COLORS, VIBRANT_GRADIENTS, VIBRANT_SHADOWS, VIBRANT_TYPOGRAPHY } from '../../constants/vibrant-design-system';

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



  // Helper to get guardian styling
  const getGuardianStyle = (type: GuardianType) => {
    switch (type) {
      case GuardianType.EMAIL:
        return {
          icon: Mail,
          gradient: VIBRANT_GRADIENTS.emailType,
          bgColor: 'rgba(0, 163, 255, 0.1)',
          iconColor: VIBRANT_COLORS.electricBlue,
          shadow: VIBRANT_SHADOWS.blueGlow,
        };
      case GuardianType.PHONE:
        return {
          icon: Phone,
          gradient: VIBRANT_GRADIENTS.phoneType,
          bgColor: 'rgba(0, 230, 118, 0.1)',
          iconColor: VIBRANT_COLORS.vibrantEmerald,
          shadow: VIBRANT_SHADOWS.greenGlow,
        };
      case GuardianType.WALLET:
        return {
          icon: Wallet,
          gradient: VIBRANT_GRADIENTS.walletType,
          bgColor: 'rgba(255, 127, 0, 0.1)',
          iconColor: VIBRANT_COLORS.radiantOrange,
          shadow: VIBRANT_SHADOWS.orangeGlow,
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
        <div className="flex items-center justify-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Sparkles className="w-6 h-6" style={{ color: VIBRANT_COLORS.radiantOrange }} />
          </motion.div>
          <motion.p 
            className="text-2xl font-black"
            style={{ 
              fontFamily: VIBRANT_TYPOGRAPHY.fonts.display,
              background: VIBRANT_GRADIENTS.ctaOrange,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            You're almost done!
          </motion.p>
          <motion.div
            animate={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Sparkles className="w-6 h-6" style={{ color: VIBRANT_COLORS.radiantOrange }} />
          </motion.div>
        </div>
        <p style={{ color: VIBRANT_COLORS.darkCarbon, fontSize: VIBRANT_TYPOGRAPHY.sizes.body.size }}>
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
                className="relative bg-white rounded-2xl p-5 border-2 border-gray-100 transition-all duration-300"
                style={{ boxShadow: VIBRANT_SHADOWS.cardFloat }}
                whileHover={{ 
                  boxShadow: style.shadow,
                  scale: 1.02,
                  borderColor: style.iconColor,
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
                    style={{ background: VIBRANT_GRADIENTS.successGradient }}
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
            background: VIBRANT_GRADIENTS.successGradient,
            border: 'none',
            boxShadow: VIBRANT_SHADOWS.successGlow,
          }}
          whileHover={{ scale: 1.02, boxShadow: '0px 15px 40px rgba(0, 230, 118, 0.5), 0px 8px 20px rgba(110, 255, 0, 0.4)' }}
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
              style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className="w-6 h-6 text-white" />
            </motion.div>
            
            <div className="flex-1">
              <motion.p 
                className="font-bold text-xl mb-2"
                style={{ color: VIBRANT_COLORS.pureWhite, textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {guardians.length} guardians will secure your wallet
              </motion.p>
              
              <motion.p 
                className="text-sm font-medium mb-4"
                style={{ color: VIBRANT_COLORS.pureWhite, opacity: 0.9 }}
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
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
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
                      className="text-xs font-bold mb-1"
                      style={{ color: VIBRANT_COLORS.pureWhite }}
                    >
                      100% Secure & Private
                    </p>
                    <p 
                      className="text-xs leading-relaxed"
                      style={{ color: VIBRANT_COLORS.pureWhite, opacity: 0.9 }}
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
          className="flex items-center gap-2 text-sm transition-all duration-300"
          style={{ color: VIBRANT_COLORS.electricBlue }}
        >
          <Info className="w-4 h-4" />
          <span>What happens next?</span>
          <ChevronRight className={`w-4 h-4 transition-transform ${showWhatHappensNext ? 'rotate-90' : ''}`} />
        </button>
        
        {showWhatHappensNext && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 rounded-xl p-5"
            style={{
              background: `linear-gradient(135deg, ${VIBRANT_COLORS.info.light} 0%, rgba(224, 255, 255, 0.6) 100%)`,
              border: `1px solid ${VIBRANT_COLORS.electricTeal}`,
            }}
          >
            <h4 className="font-bold mb-3" style={{ color: VIBRANT_COLORS.electricTeal }}>Next Steps</h4>
            <ol className="space-y-2 text-sm" style={{ color: VIBRANT_COLORS.darkCarbon }}>
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
            
            <div className="mt-4 pt-4 border-t" style={{ borderColor: VIBRANT_COLORS.electricTeal + '40' }}>
              <p className="text-xs flex items-start gap-2" style={{ color: VIBRANT_COLORS.info.dark }}>
                <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: VIBRANT_COLORS.electricTeal }} />
                If a guardian doesn't accept within 48 hours, you can resend or replace them
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Progress Indicator */}
      <motion.div 
        className="rounded-2xl p-5"
        style={{
          background: VIBRANT_GRADIENTS.lightBackground,
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold" style={{ color: VIBRANT_COLORS.darkCarbon }}>Setup Progress</span>
          <span className="text-sm font-semibold" style={{ color: VIBRANT_COLORS.electricLime }}>Step 3 of 3</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: '66%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-3 rounded-full"
            style={{ background: VIBRANT_GRADIENTS.successGradient }}
          />
        </div>
        <p className="text-xs font-medium mt-3" style={{ color: VIBRANT_COLORS.vibrantEmerald }}>
          ✨ Ready to send invitations!
        </p>
      </motion.div>

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
          variant="success"
          disabled={isSubmitting}
          icon={
            !isSubmitting ? (
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Send className="w-5 h-5" />
              </motion.div>
            ) : undefined
          }
        >
          {isSubmitting ? 'Sending Invitations...' : '🚀 Send Invitations'}
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
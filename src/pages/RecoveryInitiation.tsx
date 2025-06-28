import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Unlock, AlertTriangle, Smartphone, Globe, Chrome, ArrowRight, ChevronDown, Key, Clock } from 'lucide-react';
import { recoveryApi, getDeviceInfo } from '../api/recovery';
import { useToast } from '../contexts/ToastContext';
// Removed unused imports
import {
  VIBRANT_COLORS,
  VIBRANT_GRADIENTS,
  VIBRANT_SHADOWS,
  VIBRANT_TYPOGRAPHY,
} from '../constants/vibrant-design-system';

export const RecoveryInitiation: React.FC = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  const initiateRecoveryMutation = useMutation({
    mutationFn: recoveryApi.initiateRecovery,
    onSuccess: (session) => {
      showSuccess('Recovery initiated! Notifying your guardians...');
      // Navigate to progress screen with session ID
      navigate(`/recovery/progress/${session.sessionId}`);
    },
    onError: (error: any) => {
      if (error.message?.includes('already exists')) {
        showError('A recovery is already in progress');
        // Optionally navigate to existing session
        navigate('/recovery/active');
      } else {
        showError(error.message || 'Failed to initiate recovery');
      }
    }
  });

  const handleInitiateRecovery = async () => {
    try {
      const deviceInfo = getDeviceInfo();
      
      await initiateRecoveryMutation.mutateAsync({
        deviceInfo,
        reason: reason.trim() || undefined
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="h-full relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F8F8FA 0%, #EFEFF5 100%)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: VIBRANT_GRADIENTS.primaryAction }}
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-10 left-10 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: VIBRANT_GRADIENTS.ctaOrange }}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 h-full overflow-y-auto"
      >
        <div className="max-w-xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-10">
            {/* Hero Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative w-28 h-28 mx-auto mb-6"
            >
              {/* Background Circle with Gradient */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 163, 255, 0.1) 0%, rgba(163, 0, 255, 0.1) 100%)',
                  boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.05)',
                }}
              />
              
              {/* Animated Glow */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #00A3FF 0%, #A300FF 100%)',
                  filter: 'blur(20px)',
                }}
              />
              
              {/* Icon Container */}
              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-full h-full rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00A3FF 0%, #A300FF 100%)',
                  boxShadow: VIBRANT_SHADOWS.primaryGlow,
                }}
              >
                <Unlock className="w-14 h-14 text-white" strokeWidth={2.5} />
              </motion.div>
            </motion.div>
            
            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl mb-3"
              style={{
                fontFamily: VIBRANT_TYPOGRAPHY.fonts.display,
                fontWeight: VIBRANT_TYPOGRAPHY.weights.black,
                color: VIBRANT_COLORS.darkCarbon,
              }}
            >
              Recover Your Wallet
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg"
              style={{ color: '#777777' }}
            >
              Request help from your guardians to regain access
            </motion.p>
          </div>

          {/* Warning Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative mb-8 p-6 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 100%)',
              boxShadow: '0 0 0 2px rgba(255, 127, 0, 0.1)',
            }}
          >
            {/* Pulsating Border Glow */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                boxShadow: '0 0 20px rgba(255, 127, 0, 0.3)',
              }}
            />
            
            <div className="relative">
              {/* Header with Icon */}
              <div className="flex items-center gap-3 mb-4">
                {/* Warning Icon with Animation */}
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex-shrink-0"
                >
                  <AlertTriangle 
                    className="w-8 h-8" 
                    style={{ color: VIBRANT_COLORS.radiantOrange }}
                    strokeWidth={2.5}
                  />
                </motion.div>
                
                <h3 
                  className="text-xl font-bold"
                  style={{ color: '#CC6600' }}
                >
                  Before You Continue
                </h3>
              </div>
              
              {/* Content */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium" style={{ color: '#CC6600' }}>•</span>
                  <p className="text-base flex-1" style={{ color: '#CC6600', lineHeight: '1.6' }}>
                    This will <span className="font-bold">notify all your guardians</span> via email
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-base font-medium mt-1" style={{ color: '#CC6600' }}>•</span>
                  <p className="text-base flex-1 flex items-center flex-wrap gap-2" style={{ color: '#CC6600', lineHeight: '1.6' }}>
                    You'll need your <span className="font-bold">master password</span> to complete recovery
                    <Key className="w-4 h-4 inline-block" />
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-base font-medium mt-1" style={{ color: '#CC6600' }}>•</span>
                  <p className="text-base flex-1 flex items-center flex-wrap gap-2" style={{ color: '#CC6600', lineHeight: '1.6' }}>
                    Recovery expires after <span className="font-bold">24 hours</span>
                    <Clock className="w-4 h-4 inline-block animate-pulse" />
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Device Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 p-6 bg-white rounded-2xl"
            style={{
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h3 
              className="text-lg mb-4"
              style={{
                fontWeight: VIBRANT_TYPOGRAPHY.weights.semibold,
                color: VIBRANT_COLORS.darkCarbon,
              }}
            >
              Recovery will be initiated from:
            </h3>
            
            <div className="space-y-4">
              {/* Device */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5" style={{ color: '#777777' }} />
                  <span className="text-base" style={{ color: '#777777' }}>Device:</span>
                </div>
                <span className="text-base font-medium" style={{ color: VIBRANT_COLORS.darkCarbon }}>
                  {navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser'}
                </span>
              </div>
              
              {/* Platform */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5" style={{ color: '#777777' }} />
                  <span className="text-base" style={{ color: '#777777' }}>Platform:</span>
                </div>
                <span className="text-base font-medium" style={{ color: VIBRANT_COLORS.darkCarbon }}>Web</span>
              </div>
              
              {/* Browser */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Chrome className="w-5 h-5" style={{ color: '#777777' }} />
                  <span className="text-base" style={{ color: '#777777' }}>Browser:</span>
                </div>
                <span className="text-base font-medium" style={{ color: VIBRANT_COLORS.darkCarbon }}>
                  {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                   navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                   navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Reason Input (Optional) */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => setShowReasonInput(!showReasonInput)}
              className="text-base font-medium flex items-center transition-all"
              style={{ color: '#3A86FF' }}
            >
              {showReasonInput ? 'Hide' : 'Add'} recovery reason (optional)
              <motion.div
                animate={{ rotate: showReasonInput ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 ml-2" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {showReasonInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Lost access to phone, Forgot password, Device replacement..."
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    style={{
                      fontSize: '16px',
                      backgroundColor: '#FAFBFC',
                    }}
                    rows={3}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Actions */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {/* Primary CTA Button */}
            <motion.button
              onClick={handleInitiateRecovery}
              disabled={initiateRecoveryMutation.isPending}
              className="relative w-full py-5 px-8 rounded-2xl font-bold text-lg text-white overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #007BFF 0%, #5E00FF 100%)',
                boxShadow: '0 10px 30px rgba(0, 123, 255, 0.3), 0 5px 15px rgba(94, 0, 255, 0.2)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated Glow Effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 123, 255, 0.3) 0%, rgba(94, 0, 255, 0.3) 100%)',
                }}
                animate={{
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              <span className="relative flex items-center justify-center">
                {initiateRecoveryMutation.isPending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    Start Recovery Process
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </>
                )}
              </span>
            </motion.button>
            
            {/* Cancel Link */}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full text-center font-medium py-3 transition-all hover:underline"
              style={{ color: '#777777' }}
            >
              Cancel
            </button>
          </motion.div>

          {/* Help Text */}
          <motion.div 
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-sm text-gray-500">
              Need help? Check our{' '}
              <a 
                href="#" 
                className="font-medium transition-colors hover:underline"
                style={{ color: VIBRANT_COLORS.electricBlue }}
              >
                recovery guide
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
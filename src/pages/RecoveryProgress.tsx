import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Wallet, Shield, CheckCircle2, Clock, AlertCircle, Sparkles, RefreshCw, X } from 'lucide-react';
import { recoveryApi } from '../api/recovery';
import type { CollectedShare } from '../api/recovery';
import { useToast } from '../contexts/ToastContext';
// Removed unused imports
import { RecoveryModal } from '../components/recovery/RecoveryModal';
import {
  VIBRANT_COLORS,
  VIBRANT_GRADIENTS,
  VIBRANT_SHADOWS,
  VIBRANT_TYPOGRAPHY,
} from '../constants/vibrant-design-system';

interface GuardianStatusProps {
  guardian: {
    guardianId: string;
    name: string;
    type: string;
    hasSubmitted: boolean;
    submittedAt?: string;
  };
  index: number;
}

const GuardianStatus: React.FC<GuardianStatusProps> = ({ guardian, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getGuardianIcon = () => {
    switch (guardian.type) {
      case 'EMAIL':
        return Mail;
      case 'PHONE':
        return Phone;
      case 'WALLET':
        return Wallet;
      default:
        return Shield;
    }
  };

  const getGuardianGradient = () => {
    switch (guardian.type) {
      case 'EMAIL':
        return VIBRANT_GRADIENTS.emailType;
      case 'PHONE':
        return VIBRANT_GRADIENTS.phoneType;
      case 'WALLET':
        return VIBRANT_GRADIENTS.walletType;
      default:
        return VIBRANT_GRADIENTS.primaryAction;
    }
  };

  const Icon = getGuardianIcon();

  return (
    <motion.div
      initial={{ opacity: 0, x: -50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative overflow-hidden"
      style={{
        boxShadow: guardian.hasSubmitted ? VIBRANT_SHADOWS.successGlow : VIBRANT_SHADOWS.cardFloat,
      }}
    >
      {/* Gradient Background */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-10"
        style={{ background: guardian.hasSubmitted ? VIBRANT_GRADIENTS.successGradient : 'transparent' }}
      />
      
      {/* Content */}
      <div className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
        guardian.hasSubmitted 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Animated Icon Container */}
            <motion.div
              animate={guardian.hasSubmitted ? {
                scale: [1, 1.2, 1],
              } : {
                rotate: isHovered ? 360 : 0,
              }}
              transition={{
                duration: guardian.hasSubmitted ? 0.6 : 0.5,
                repeat: guardian.hasSubmitted ? 0 : 0,
              }}
              className="relative"
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  background: guardian.hasSubmitted ? VIBRANT_GRADIENTS.successGradient : getGuardianGradient(),
                }}
              >
                {guardian.hasSubmitted ? (
                  <CheckCircle2 className="w-7 h-7 text-white" />
                ) : (
                  <Icon className="w-7 h-7 text-white" />
                )}
              </div>
              
              {/* Pulse animation for waiting guardians */}
              {!guardian.hasSubmitted && (
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-xl"
                  style={{ background: getGuardianGradient() }}
                />
              )}
            </motion.div>
            
            <div>
              <p className="font-semibold text-lg text-gray-900">{guardian.name}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600 capitalize">{guardian.type.toLowerCase()} Guardian</span>
                {guardian.hasSubmitted && guardian.submittedAt && (
                  <span className="text-xs text-green-600 font-medium">
                    • {new Date(guardian.submittedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            {guardian.hasSubmitted ? (
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Approved</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-gray-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-600">Pending</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Animated background shapes
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Floating gradient orbs */}
    <motion.div
      animate={{
        x: [0, 100, 0],
        y: [0, -50, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20"
      style={{ background: VIBRANT_GRADIENTS.emailType }}
    />
    <motion.div
      animate={{
        x: [0, -100, 0],
        y: [0, 50, 0],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20"
      style={{ background: VIBRANT_GRADIENTS.phoneType }}
    />
    
    {/* Grid pattern */}
    <div 
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: `
          linear-gradient(${VIBRANT_COLORS.electricBlue}22 1px, transparent 1px),
          linear-gradient(90deg, ${VIBRANT_COLORS.electricBlue}22 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
  </div>
);

export const RecoveryProgress: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [collectedShares, setCollectedShares] = useState<CollectedShare[] | null>(null);
  const [progress, setProgress] = useState(0);

  // Query for initial session data
  const { data: session, refetch } = useQuery({
    queryKey: ['recoverySession', sessionId],
    queryFn: () => recoveryApi.getRecoveryStatus(sessionId!),
    enabled: !!sessionId,
    refetchInterval: false // We'll use custom monitoring
  });

  // Monitor recovery progress - DISABLED to stop auto API calls
  // useEffect(() => {
  //   if (!sessionId) return;

  //   const stopMonitoring = monitorRecovery(sessionId, async (updatedSession) => {
      
  //     // Update local state
  //     // refetch();
      
  //     // Check if threshold is met
  //     if (updatedSession.state === 'approved' || 
  //         updatedSession.approvalsDetailed.received >= updatedSession.approvalsDetailed.required) {
        
  //       // showSuccess('Threshold reached! Fetching guardian shares...');
        
  //       // try {
  //       //   // Fetch collected shares
  //       //   const sharesResponse = await recoveryApi.getCollectedShares(sessionId);
  //       //   // setCollectedShares(sharesResponse.shares);
          
  //       //   // Navigate to password authentication
  //       //   setTimeout(() => {
  //       //     navigate(`/recovery/authenticate/${sessionId}`, {
  //       //       state: { 
  //       //         shares: sharesResponse.shares,
  //       //         session: updatedSession
  //       //       }
  //       //     });
  //       //   }, 1500);
  //       // } catch (error) {
  //       //   console.error('Failed to fetch shares:', error);
  //       //   showError('Failed to fetch guardian shares');
  //       // }
  //     }
      
  //     // Handle failure states
  //     if (updatedSession.state === 'failed') {
  //       showError('Recovery failed. Please try again.');
  //     } else if (updatedSession.state === 'expired') {
  //       showError('Recovery session expired.');
  //       setTimeout(() => navigate('/recovery/start'), 2000);
  //     }
  //   });

  //   return stopMonitoring;
  // }, [sessionId, navigate, showError, showSuccess, refetch]);

  // Animate progress
  useEffect(() => {
    if (session) {
      const targetProgress = (session.approvalsDetailed.received / session.approvalsDetailed.required) * 100;
      const timer = setTimeout(() => setProgress(targetProgress), 100);
      return () => clearTimeout(timer);
    }
  }, [session]);

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: VIBRANT_GRADIENTS.primaryAction }}
        >
          <Shield className="w-10 h-10 text-white" />
        </motion.div>
      </div>
    );
  }

  const remainingGuardians = session.approvalsDetailed.required - session.approvalsDetailed.received;
  const isThresholdMet = remainingGuardians <= 0;

  // Handle opening recovery modal and fetching shares
  const handleStartRecovery = async () => {
    try {
      showSuccess('Fetching guardian shares...');
      
      const shares = await recoveryApi.getCollectedShares(sessionId!);
      // console.log('Shares response:', sharesResponse);
      
      // The API returns shares in 'data' field, not 'shares'
      // const shares = sharesResponse?.data || sharesResponse?.shares || [];
      console.log('Shares data:', shares);
      console.log('Shares length:', shares?.length);
      
      if (shares && shares.length > 0) {
        setCollectedShares(shares);
        console.log('Opening recovery modal...');
        setShowRecoveryModal(true);
      } else {
        showError('No guardian shares found. Please make sure guardians have submitted their shares.');
        console.warn('No shares available:');
      }
    } catch (error: any) {
      console.error('Failed to fetch shares:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        data: error.response?.data
      });
      showError('Failed to fetch guardian shares: ' + (error.message || 'Unknown error'));
    }
  };

  // Handle successful recovery
  const handleRecoverySuccess = (privateKey: string) => {
    console.log('Recovery successful, private key recovered:', privateKey.substring(0, 10) + '...');
    showSuccess('Wallet recovered successfully!');
    
    // Navigate to profile page to see the recovered wallet
    setTimeout(() => {
      navigate('/profile');
    }, 2000);
  };

  return (
    <div className="h-full bg-gray-50 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="h-full overflow-y-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto p-6"
        >
          {/* Header with gradient text */}
          <motion.div 
            className="text-center mb-10"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 
              className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              style={{ fontFamily: VIBRANT_TYPOGRAPHY.fonts.display }}
            >
              Recovery in Progress
            </h1>
            <p className="text-lg text-gray-600">
              {isThresholdMet 
                ? "✨ Threshold reached! Ready to recover your wallet"
                : "Collecting guardian approvals to restore your wallet"
              }
            </p>
          </motion.div>

          {/* Dynamic Progress Visualization */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            {/* Circular Progress */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              {/* Background circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 280 280">
                <circle
                  cx="140"
                  cy="140"
                  r="110"
                  stroke={isThresholdMet ? "url(#progressGradient)" : "#E5E7EB"}
                  strokeWidth="12"
                  fill="none"
                  style={{
                    opacity: isThresholdMet ? 0.3 : 1,
                  }}
                />
              </svg>
              
              {/* Progress circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 280 280">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={VIBRANT_COLORS.electricBlue} />
                    <stop offset="50%" stopColor={VIBRANT_COLORS.neonPurple} />
                    <stop offset="100%" stopColor={VIBRANT_COLORS.vibrantEmerald} />
                  </linearGradient>
                </defs>
                <motion.circle
                  cx="140"
                  cy="140"
                  r="110"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  style={{
                    stroke: `url(#progressGradient)`,
                    strokeDasharray: isThresholdMet ? "none" : `${2 * Math.PI * 110}`,
                    strokeDashoffset: isThresholdMet ? 0 : 2 * Math.PI * 110 * (1 - progress / 100),
                  }}
                  initial={{ 
                    strokeDashoffset: 2 * Math.PI * 110,
                    opacity: 0 
                  }}
                  animate={{ 
                    strokeDashoffset: isThresholdMet ? 0 : 2 * Math.PI * 110 * (1 - progress / 100),
                    opacity: 1,
                  }}
                  transition={{ 
                    strokeDashoffset: { duration: 1, ease: "easeInOut" },
                    opacity: { duration: 0.3 }
                  }}
                />
                {/* Glow effect when threshold is met */}
                {isThresholdMet && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.3, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      transformOrigin: "140px 140px"
                    }}
                  >
                    <circle
                      cx="140"
                      cy="140"
                      r="110"
                      strokeWidth="24"
                      fill="none"
                      stroke="url(#progressGradient)"
                    />
                  </motion.g>
                )}
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    scale: isThresholdMet ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: isThresholdMet ? Infinity : 0,
                    repeatDelay: 2,
                  }}
                >
                  <Shield className="w-16 h-16 mb-3" style={{ color: VIBRANT_COLORS.electricBlue }} />
                </motion.div>
                <div className="text-center">
                  <motion.div
                    key={session.approvalsDetailed.received}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl font-bold mb-1"
                    style={{ 
                      background: VIBRANT_GRADIENTS.primaryAction,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {session.approvalsDetailed.received}/{session.approvalsDetailed.required}
                  </motion.div>
                  <p className="text-sm text-gray-600 font-medium">Guardians Approved</p>
                </div>
              </div>
              
              {/* Animated particles when threshold is met */}
              {isThresholdMet && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        background: VIBRANT_GRADIENTS.successGradient,
                        left: '50%',
                        top: '50%',
                      }}
                      animate={{
                        x: [0, (Math.random() - 0.5) * 200],
                        y: [0, (Math.random() - 0.5) * 200],
                        opacity: [1, 0],
                        scale: [0, 1.5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl p-4 text-center"
                style={{ boxShadow: VIBRANT_SHADOWS.cardFloat }}
              >
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: VIBRANT_COLORS.vibrantEmerald }} />
                <p className="text-3xl font-bold" style={{ color: VIBRANT_COLORS.vibrantEmerald }}>
                  {session.approvalsDetailed.received}
                </p>
                <p className="text-sm text-gray-600 font-medium">Approved</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl p-4 text-center"
                style={{ boxShadow: VIBRANT_SHADOWS.cardFloat }}
              >
                <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: VIBRANT_COLORS.electricYellow }} />
                <p className="text-3xl font-bold" style={{ color: VIBRANT_COLORS.electricYellow }}>
                  {remainingGuardians > 0 ? remainingGuardians : 0}
                </p>
                <p className="text-sm text-gray-600 font-medium">Pending</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl p-4 text-center"
                style={{ boxShadow: VIBRANT_SHADOWS.cardFloat }}
              >
                <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: VIBRANT_COLORS.electricBlue }} />
                <p className="text-3xl font-bold" style={{ color: VIBRANT_COLORS.electricBlue }}>
                  {session.approvalsDetailed.required}
                </p>
                <p className="text-sm text-gray-600 font-medium">Required</p>
              </motion.div>
            </div>

            {/* CTA Section */}
            {isThresholdMet ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl p-6"
                style={{
                  background: VIBRANT_GRADIENTS.successGradient,
                  boxShadow: VIBRANT_SHADOWS.successGlow,
                }}
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <motion.div
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20% 50%, white 0%, transparent 50%)`,
                      backgroundSize: '100px 100px',
                    }}
                  />
                </div>
                
                <div className="relative z-10 text-center">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Ready to Recover!
                  </h3>
                  <p className="text-white/90 mb-6">
                    All required guardians have approved. Let's restore your wallet.
                  </p>
                  <motion.button
                    onClick={handleStartRecovery}
                    className="w-full py-4 px-8 bg-white text-green-600 font-bold rounded-2xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    }}
                  >
                    Start Recovery Process →
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: VIBRANT_COLORS.electricBlue }} />
                <p className="text-lg font-semibold text-blue-900 mb-2">
                  Waiting for {remainingGuardians} More Guardian{remainingGuardians > 1 ? 's' : ''}
                </p>
                <p className="text-blue-700">
                  Your guardians have been notified. They need to approve the recovery request.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Guardian Status Cards */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Guardian Status</h3>
            <div className="space-y-4">
              <AnimatePresence>
                {session.approvalsDetailed.guardians.map((guardian, index) => (
                  <GuardianStatus 
                    key={guardian.guardianId}
                    guardian={guardian}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Session Info Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 mb-8"
            style={{ boxShadow: VIBRANT_SHADOWS.cardFloat }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-medium">Session ID</span>
                <code className="text-sm font-mono bg-gray-200 px-3 py-1 rounded-lg">
                  ...{session.sessionId.slice(-12)}
                </code>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-medium">Started</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(session.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-medium">Expires</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(session.expiresAt).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-4">
            <motion.button
              onClick={async () => {
                try {
                  await refetch();
                  showSuccess('Status refreshed');
                } catch (error) {
                  showError('Failed to refresh status');
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white rounded-2xl font-semibold transition-all"
              style={{ 
                boxShadow: VIBRANT_SHADOWS.cardFloat,
                color: VIBRANT_COLORS.electricBlue,
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: VIBRANT_SHADOWS.cardHover,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Status
            </motion.button>

            <motion.button
              onClick={() => {
                if (confirm('Are you sure you want to cancel this recovery?')) {
                  recoveryApi.cancelRecovery(sessionId!);
                  navigate('/dashboard');
                }
              }}
              className="flex items-center justify-center gap-2 py-4 px-6 bg-white rounded-2xl font-semibold transition-all"
              style={{ 
                boxShadow: VIBRANT_SHADOWS.cardFloat,
                color: VIBRANT_COLORS.vibrantScarlet,
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: VIBRANT_SHADOWS.cardHover,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <X className="w-5 h-5" />
              Cancel
            </motion.button>
          </div>

          {/* Help Text */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-sm text-gray-500">
              Guardians have been notified via their preferred contact method
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Recovery Modal */}
      {(() => {
        return showRecoveryModal && collectedShares && session && (
          <RecoveryModal
            isOpen={showRecoveryModal}
            onClose={() => setShowRecoveryModal(false)}
            sessionId={sessionId!}
            session={session}
            shares={collectedShares}
            onSuccess={handleRecoverySuccess}
          />
        );
      })()}
    </div>
  );
};
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { guardianApi } from '../api/guardian';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ModernButton } from '../components/ui/ModernButton';
import { useEnhancedSuccessAnimation } from '../components/ui/EnhancedSuccessAnimation';
import { getTimeSinceDate, formatGuardianDisplay } from '../utils/guardianHelpers';
import { VIBRANT_COLORS, VIBRANT_GRADIENTS, VIBRANT_SHADOWS, VIBRANT_TYPOGRAPHY } from '../constants/vibrant-design-system';
import { GuardianSetupFlow } from '../utils/guardianSetupFlow';
import { FrontendSaltService } from '../utils/saltDerivation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';


export const SessionMonitoring: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { triggerSuccess, SuccessComponent, resetTrigger } = useEnhancedSuccessAnimation();
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const prevSessionStatusRef = React.useRef<string>('');

  // Query current session with polling
  const { data: currentSession, refetch, isRefetching } = useQuery({
    queryKey: ['currentSession'],
    queryFn: () => guardianApi.getCurrentSession(),
    refetchInterval: ({ state }) => {
      // Poll every 30 seconds if waiting for responses
      if (state.data?.status === 'WAITING_FOR_ALL' || state.data?.status === 'SOME_DECLINED') {
        return 30000;
      }
      return false;
    }
  });

  // Mutation to complete setup
  const distributeMutation = useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string, data: any }) => 
      guardianApi.distributeShares(sessionId, data),
    onSuccess: () => {
      // Invalidate and refetch session data
      queryClient.invalidateQueries({ queryKey: ['currentSession'] });
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      
      // Clear master password from state
      setMasterPassword('');
      
      // Show success and navigate
      triggerSuccess('Wallet secured! Your encrypted shares have been distributed to guardians.');
      setTimeout(() => {
        navigate('/guardian-dashboard');
      }, 3000);
    },
    onError: (error) => {
      console.error('Failed to distribute shares:', error);
      setPasswordError('Failed to distribute shares. Please try again.');
    }
  });

  // Pull to refresh functionality
  const handleRefresh = useCallback(async () => {
    setLastRefreshTime(Date.now());
    await refetch();
  }, [refetch]);


  // State for master password input
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle completing the setup with new dual-salt API
  const handleCompleteSetup = useCallback(async () => {
    if (!masterPassword) {
      setShowPasswordPrompt(true);
      return;
    }

    if (currentSession?.sessionId) {
      try {
        // The GuardianSetupFlow will handle preparing session and getting backend salt
        
        // Step 1: Generate recovery secret (unused in current implementation)
        // const recoverySecret = crypto.getRandomValues(new Uint8Array(32))
        //   .reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');
        
        // Step 2: Use GuardianSetupFlow with dual-salt encryption
        const encryptedSharesRaw = await GuardianSetupFlow.proceedWithSetup({
          sessionId: currentSession.sessionId,
          masterPassword,
        });
        
        // Step 3: Format encrypted shares for distribution API
        console.log('📤 Preparing shares for distribution...');
        const encryptedShares = encryptedSharesRaw.map((share, index) => {
          console.log(`Share ${index} for guardian ${share.guardianId}:`, {
            inputLength: share.encryptedShare.length,
            inputSample: share.encryptedShare.substring(0, 50) + '...',
            isAlreadyBase64: true  // ShareEncryptionService already returns base64
          });
          
          return {
            guardianId: share.guardianId,
            encryptedShare: share.encryptedShare  // Already base64 encoded by ShareEncryptionService!
          };
        });
        
        // Step 4: Distribute shares to guardians
        const distributeData = {
          encryptedShares,
          encryptionMetadata: {
            version: 'dual-salt-v1',
            algorithm: 'AES-256-GCM',
            keyDerivation: 'PBKDF2-SHA256'
          }
        };
        
        distributeMutation.mutate({ sessionId: currentSession.sessionId, data: distributeData });
      } catch (error) {
        console.error('Failed to prepare setup data:', error);
        setPasswordError(error instanceof Error ? error.message : 'Setup failed');
      }
    }
  }, [currentSession, masterPassword, distributeMutation]);

  // Handle password submission
  const handlePasswordSubmit = useCallback(async () => {
    if (!masterPassword.trim()) {
      setPasswordError('Master password is required');
      return;
    }

    if (!confirmPassword.trim()) {
      setPasswordError('Please confirm your password');
      return;
    }

    if (masterPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      // Validate password strength
      FrontendSaltService.validatePasswordStrength(masterPassword);
      
      setPasswordError('');
      setShowPasswordPrompt(false);
      
      // Proceed with setup
      await handleCompleteSetup();
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Invalid password');
    }
  }, [masterPassword, confirmPassword, handleCompleteSetup]);

  // Check if setup is truly completed (status = COMPLETED) and redirect
  React.useEffect(() => {
    if (currentSession) {
      // Only redirect when session status is actually COMPLETED (not ALL_ACCEPTED)
      if (currentSession.status === 'COMPLETED') {
        triggerSuccess('Setup completed successfully! Your wallet is now secured.');
        
        // Navigate to dashboard after animation
        setTimeout(() => {
          navigate('/guardian-dashboard');
        }, 3000);
      }
      
      // Reset trigger when session changes
      if (currentSession.sessionId !== prevSessionStatusRef.current) {
        resetTrigger();
        prevSessionStatusRef.current = currentSession.sessionId;
      }
    }
  }, [currentSession, triggerSuccess, resetTrigger, navigate]);

  // Helper function
  const formatLastRefresh = () => {
    const seconds = Math.floor((Date.now() - lastRefreshTime) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  };

  if (!currentSession) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="text-center">
          <p className="text-gray-600 mb-4">No active setup session found</p>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const acceptedCount = currentSession.statistics.acceptedCount;
  const declinedCount = currentSession.statistics.declinedCount || 0;
  const totalInvitations = currentSession.statistics.totalInvitations;
  const minimumNeeded = currentSession.minimumAcceptances;
  const totalResponded = acceptedCount + declinedCount;
  const stillWaitingFor = totalInvitations - totalResponded;

  return (
    <div 
      className="min-h-full flex flex-col relative"
      style={{
        background: VIBRANT_GRADIENTS.lightBackground,
      }}
    >
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 20% 20%, ${VIBRANT_COLORS.electricBlue} 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, ${VIBRANT_COLORS.deepViolet} 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Vibrant Header - Dynamic Progress Hub */}
      <motion.div 
        className="px-4 sm:px-6 pt-safe-top pb-8 border-b relative overflow-hidden flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${stillWaitingFor === 0 ? VIBRANT_COLORS.vibrantEmerald : VIBRANT_COLORS.electricBlue} 0%, ${stillWaitingFor === 0 ? VIBRANT_COLORS.electricLime : VIBRANT_COLORS.neonPurple} 100%)`,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          boxShadow: stillWaitingFor === 0 ? '0 8px 32px rgba(0, 230, 118, 0.4)' : '0 8px 32px rgba(163, 0, 255, 0.3)'
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Dynamic background pattern */}
        <div className='absolute inset-0 overflow-hidden'>
          <motion.div
            className='absolute w-full h-full'
            style={{
              background: `radial-gradient(circle at 30% 40%, ${VIBRANT_COLORS.electricTeal}20 0%, transparent 50%)`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        {/* Animated particles for energy */}
        <div className='absolute inset-0 overflow-hidden'>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className='absolute w-1 h-1 bg-white rounded-full'
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(0.5px)',
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1.2, 0.5],
                y: [-10, 10, -10],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <motion.h1 
              className="font-black mb-3"
              style={{
                fontSize: '32px',
                color: VIBRANT_COLORS.pureWhite,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                fontFamily: VIBRANT_TYPOGRAPHY.fonts.display
              }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Waiting for Guardians
            </motion.h1>
            
            {/* Hero Status Section - Dynamic Numbers */}
            <motion.div 
              className="mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <motion.span 
                  className="font-black"
                  style={{
                    fontSize: '42px',
                    color: stillWaitingFor === 0 ? VIBRANT_COLORS.electricLime : VIBRANT_COLORS.electricTeal,
                    textShadow: '0 2px 15px rgba(0, 0, 0, 0.4)',
                    fontFamily: VIBRANT_TYPOGRAPHY.fonts.display
                  }}
                  key={totalResponded}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {totalResponded}
                </motion.span>
                <span 
                  className="font-bold text-2xl"
                  style={{ color: VIBRANT_COLORS.softWhite }}
                >
                  of {totalInvitations} responded
                </span>
                {stillWaitingFor === 0 && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="text-2xl"
                  >
                    ✨
                  </motion.span>
                )}
              </div>
              <motion.p 
                className="text-base font-medium"
                style={{ color: VIBRANT_COLORS.softWhite }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {stillWaitingFor > 0 
                  ? `${acceptedCount} accepted • Waiting for ${stillWaitingFor} more ${stillWaitingFor === 1 ? 'response' : 'responses'}`
                  : `🎉 All guardians have responded! ${acceptedCount} accepted`
                }
              </motion.p>
            </motion.div>
          </div>
          <motion.button 
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: VIBRANT_COLORS.pureWhite,
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              scale: 1.05 
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>
      </motion.div>

      {/* Content - Dynamic Progress Hub */}
      <div className="flex-1 overflow-x-hidden pb-6">
        {/* Guardian Avatar Grid - Visual Progress Tracker */}
        <motion.div 
          className="mx-4 sm:mx-6 mt-6 mb-6 rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #F8F8FA 0%, #EFEFF5 100%)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 30px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 100 }}
        >
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 25% 25%, ${stillWaitingFor === 0 ? VIBRANT_COLORS.vibrantEmerald : VIBRANT_COLORS.electricTeal} 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, ${stillWaitingFor === 0 ? VIBRANT_COLORS.electricLime : VIBRANT_COLORS.electricBlue} 0%, transparent 50%)`,
              }}
            />
          </div>
          
          {/* Live Processing Indicator */}
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: stillWaitingFor > 0 ? VIBRANT_COLORS.radiantOrange : VIBRANT_COLORS.vibrantEmerald }}
              animate={stillWaitingFor > 0 ? {
                scale: [1, 1.4, 1],
                opacity: [0.7, 1, 0.7],
              } : {
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: stillWaitingFor > 0 ? 2 : 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span 
              className="text-xs font-medium"
              style={{ color: VIBRANT_COLORS.mutedGray }}
            >
              {stillWaitingFor > 0 ? 'Processing...' : 'Complete'}
            </span>
          </div>
          
          <div className="relative text-center">
            {/* Main Status Display */}
            <motion.div 
              className="mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
            >
              <motion.h2 
                className="font-black mb-4"
                style={{
                  fontSize: '28px',
                  color: stillWaitingFor === 0 ? VIBRANT_COLORS.vibrantEmerald : VIBRANT_COLORS.electricTeal,
                  fontFamily: VIBRANT_TYPOGRAPHY.fonts.display
                }}
                key={stillWaitingFor}
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {stillWaitingFor > 0 ? (
                  <span className="flex items-center justify-center gap-3">
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="text-3xl"
                    >
                      ⏳
                    </motion.span>
                    Waiting for {stillWaitingFor} {stillWaitingFor === 1 ? 'response' : 'responses'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <motion.span
                      animate={{ 
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.1, 1] 
                      }}
                      transition={{ 
                        duration: 0.6, 
                        repeat: Infinity, 
                        repeatDelay: 3 
                      }}
                      className="text-3xl"
                    >
                      🎉
                    </motion.span>
                    All guardians responded!
                  </span>
                )}
              </motion.h2>
              
              {/* Counter Display */}
              <motion.div 
                className="flex items-center justify-center gap-2 text-lg font-bold"
                style={{ color: VIBRANT_COLORS.darkCarbon }}
              >
                <motion.span
                  key={totalResponded}
                  initial={{ scale: 1.3, color: VIBRANT_COLORS.electricTeal }}
                  animate={{ scale: 1, color: VIBRANT_COLORS.darkCarbon }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {totalResponded}
                </motion.span>
                <span>of {totalInvitations} responded</span>
                <span>•</span>
                <motion.span
                  key={acceptedCount}
                  initial={{ scale: 1.3, color: VIBRANT_COLORS.vibrantEmerald }}
                  animate={{ scale: 1, color: VIBRANT_COLORS.vibrantEmerald }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {acceptedCount} accepted
                </motion.span>
              </motion.div>
            </motion.div>
          </div>

          {/* Advanced Guardian Avatar Grid - Connected Flow */}
          <div className="relative mb-8">
            {/* Connection Lines Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg 
                width="100%" 
                height="80" 
                className="absolute"
                style={{ zIndex: 1 }}
              >
                {Array.from({ length: totalInvitations - 1 }).map((_, index) => (
                  <motion.line
                    key={index}
                    x1={`${20 + (index * 60)}%`}
                    y1="50%"
                    x2={`${20 + ((index + 1) * 60)}%`}
                    y2="50%"
                    stroke={index < acceptedCount - 1 ? VIBRANT_COLORS.vibrantEmerald : 'rgba(0, 163, 255, 0.2)'}
                    strokeWidth="3"
                    strokeDasharray={index < acceptedCount - 1 ? "0" : "8,4"}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 1.2 + index * 0.2, duration: 0.8 }}
                  />
                ))}
              </svg>
            </div>
            
            {/* Guardian Avatars */}
            <div className="relative flex justify-center gap-6" style={{ zIndex: 2 }}>
              {Array.from({ length: totalInvitations }).map((_, index) => {
                let status = 'pending';
                if (index < acceptedCount) {
                  status = 'accepted';
                } else if (index < totalResponded) {
                  status = 'declined';
                }
                
                return (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.15, type: 'spring', stiffness: 200 }}
                    className="relative flex flex-col items-center"
                  >
                    {/* Avatar Circle */}
                    <motion.div
                      className="w-18 h-18 rounded-2xl flex items-center justify-center font-black text-xl relative overflow-hidden"
                      style={{
                        background: status === 'accepted' 
                          ? `linear-gradient(135deg, ${VIBRANT_COLORS.vibrantEmerald} 0%, ${VIBRANT_COLORS.electricLime} 100%)`
                          : status === 'declined' 
                            ? `linear-gradient(135deg, ${VIBRANT_COLORS.radiantOrange} 0%, ${VIBRANT_COLORS.vibrantScarlet} 100%)`
                            : 'rgba(255, 255, 255, 0.9)',
                        color: status === 'pending' ? VIBRANT_COLORS.electricBlue : VIBRANT_COLORS.pureWhite,
                        border: status === 'pending' ? `3px solid ${VIBRANT_COLORS.electricBlue}` : 'none',
                        boxShadow: status === 'accepted' 
                          ? '0 12px 30px rgba(0, 230, 118, 0.5), 0 4px 15px rgba(0, 230, 118, 0.3)' 
                          : status === 'declined' 
                            ? '0 12px 30px rgba(255, 127, 0, 0.5), 0 4px 15px rgba(255, 127, 0, 0.3)'
                            : '0 8px 20px rgba(0, 163, 255, 0.25), 0 3px 10px rgba(0, 163, 255, 0.15)',
                        backdropFilter: status === 'pending' ? 'blur(15px)' : 'none'
                      }}
                      whileHover={{ scale: 1.1, rotate: 8 }}
                      animate={status === 'accepted' ? {
                        boxShadow: [
                          '0 12px 30px rgba(0, 230, 118, 0.5), 0 4px 15px rgba(0, 230, 118, 0.3)',
                          '0 12px 30px rgba(0, 230, 118, 0.7), 0 4px 15px rgba(0, 230, 118, 0.5)',
                          '0 12px 30px rgba(0, 230, 118, 0.5), 0 4px 15px rgba(0, 230, 118, 0.3)'
                        ]
                      } : status === 'pending' ? {
                        y: [-2, 2, -2],
                      } : {}}
                      transition={{
                        boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                        y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      {/* Frosted glass effect for pending */}
                      {status === 'pending' && (
                        <motion.div 
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)`,
                            backdropFilter: 'blur(15px)'
                          }}
                          animate={{
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                      
                      {/* Content - Enhanced Icons */}
                      <div className="relative z-10 flex items-center justify-center">
                        {status === 'accepted' ? (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="text-2xl"
                          >
                            ✓
                          </motion.span>
                        ) : status === 'declined' ? (
                          <motion.span
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="text-2xl"
                          >
                            ✗
                          </motion.span>
                        ) : (
                          <motion.span
                            className="font-black text-lg"
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            {index + 1}
                          </motion.span>
                        )}
                      </div>
                      
                      {/* Sparkling success animation for accepted */}
                      {status === 'accepted' && (
                        <>
                          <motion.div
                            className="absolute inset-2 rounded-xl opacity-40"
                            style={{ background: `linear-gradient(135deg, ${VIBRANT_COLORS.vibrantEmerald} 0%, ${VIBRANT_COLORS.electricLime} 100%)` }}
                            animate={{
                              opacity: [0.4, 0.7, 0.4],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                          {/* Sparkling particles */}
                          {[...Array(3)].map((_, sparkleIndex) => (
                            <motion.div
                              key={sparkleIndex}
                              className="absolute w-1 h-1 bg-white rounded-full"
                              style={{
                                top: `${20 + Math.random() * 60}%`,
                                left: `${20 + Math.random() * 60}%`,
                              }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: sparkleIndex * 0.5,
                                ease: "easeInOut",
                              }}
                            />
                          ))}
                        </>
                      )}
                    </motion.div>
                    
                    {/* Status Label */}
                    <motion.div
                      className="mt-3 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                    >
                      <span 
                        className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: status === 'accepted' 
                            ? VIBRANT_COLORS.vibrantEmerald
                            : status === 'declined' 
                              ? VIBRANT_COLORS.vibrantScarlet
                              : 'rgba(0, 163, 255, 0.15)',
                          color: status === 'pending' ? VIBRANT_COLORS.electricBlue : VIBRANT_COLORS.pureWhite
                        }}
                      >
                        {status === 'accepted' ? 'Accepted' : status === 'declined' ? 'Declined' : 'Waiting...'}
                      </span>
                    </motion.div>
                    
                    {/* Pulse effect for pending */}
                    {status === 'pending' && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background: `radial-gradient(circle, ${VIBRANT_COLORS.electricBlue}20 0%, transparent 70%)`,
                        }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.6, 0, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* Contextual Action Boxes */}
          <div className="space-y-4 mb-6">
            {/* Threshold Reminder */}
            {acceptedCount < minimumNeeded && (
              <motion.div 
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 100%)',
                  border: `2px solid ${VIBRANT_COLORS.radiantOrange}40`,
                  boxShadow: '0 8px 25px rgba(255, 127, 0, 0.15)'
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.4, type: 'spring' }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: VIBRANT_COLORS.radiantOrange }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-bold text-lg mb-2" style={{ color: '#CC6600' }}>
                      Need at least {minimumNeeded} acceptances to proceed
                    </p>
                    <p className="text-sm mb-3" style={{ color: '#996600' }}>
                      Currently {acceptedCount} of {minimumNeeded} required guardians have accepted
                    </p>
                    <div className="flex gap-3">
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/improved-guardian-setup')}
                        icon={
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        }
                      >
                        Add More Guardians
                      </ModernButton>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Reassuring Information */}
            <motion.div 
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #E0FFFF 0%, #C0E0FF 100%)',
                border: `2px solid ${VIBRANT_COLORS.electricTeal}40`,
                boxShadow: '0 8px 25px rgba(0, 206, 209, 0.15)'
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.6, type: 'spring' }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: VIBRANT_COLORS.electricTeal }}
                  animate={{ 
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 0 10px rgba(0, 206, 209, 0.3)',
                      '0 0 20px rgba(0, 206, 209, 0.5)',
                      '0 0 10px rgba(0, 206, 209, 0.3)'
                    ]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </motion.div>
                <div className="flex-1">
                  <p className="font-bold text-lg mb-2" style={{ color: '#004080' }}>
                    💡 Most guardians respond within 2-4 hours
                  </p>
                  <p className="text-sm" style={{ color: '#006699' }}>
                    Your invitations are being delivered. You'll get real-time notifications as guardians respond.
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Contact Tip */}
            <motion.div 
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #FFFDE7 0%, #FFF9C4 100%)',
                border: `2px solid ${VIBRANT_COLORS.electricYellow}40`,
                boxShadow: '0 8px 25px rgba(255, 255, 0, 0.1)'
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.8, type: 'spring' }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#FFB300' }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </motion.div>
                <div className="flex-1">
                  <p className="font-bold text-lg mb-2" style={{ color: '#E65100' }}>
                    💬 Tip: You can contact your guardians directly
                  </p>
                  <p className="text-sm mb-3" style={{ color: '#F57C00' }}>
                    If needed, reach out personally to explain the Social Recovery request
                  </p>
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Open native share or messaging
                      if (navigator.share) {
                        navigator.share({
                          title: 'Social Recovery Request',
                          text: 'I\'ve sent you a Social Recovery invitation to help secure my wallet. Please check your email/messages!'
                        });
                      }
                    }}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    }
                  >
                    Send Reminder
                  </ModernButton>
                </div>
              </div>
            </motion.div>
          </div>

          {/* What Happens Next Section */}
          <motion.div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2.0, type: 'spring' }}
          >
            <motion.h3 
              className="font-black text-xl mb-6 flex items-center gap-3"
              style={{ color: VIBRANT_COLORS.darkCarbon, fontFamily: VIBRANT_TYPOGRAPHY.fonts.display }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 2.1 }}
            >
              <svg className="w-6 h-6" style={{ color: VIBRANT_COLORS.electricTeal }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What happens next?
            </motion.h3>
            
            <div className="space-y-4">
              {[
                {
                  number: 1,
                  title: "Guardians receive invitations",
                  description: "Each guardian gets a secure invitation via their preferred method",
                  icon: "📧",
                  gradient: `linear-gradient(135deg, ${VIBRANT_COLORS.electricBlue} 0%, ${VIBRANT_COLORS.neonPurple} 100%)`
                },
                {
                  number: 2,
                  title: "48-hour response window",
                  description: "Guardians have 48 hours to accept or decline their invitation",
                  icon: "⏰",
                  gradient: `linear-gradient(135deg, ${VIBRANT_COLORS.electricTeal} 0%, ${VIBRANT_COLORS.electricLime} 100%)`
                },
                {
                  number: 3,
                  title: "Real-time notifications",
                  description: "You'll receive instant updates as guardians respond",
                  icon: "🔔",
                  gradient: `linear-gradient(135deg, ${VIBRANT_COLORS.radiantOrange} 0%, ${VIBRANT_COLORS.electricYellow} 100%)`
                },
                {
                  number: 4,
                  title: "Setup completes automatically",
                  description: `Once ${minimumNeeded} guardians accept, your wallet is secured!`,
                  icon: "✨",
                  gradient: `linear-gradient(135deg, ${VIBRANT_COLORS.vibrantEmerald} 0%, ${VIBRANT_COLORS.electricLime} 100%)`
                }
              ].map((step, index) => (
                <motion.div
                  key={step.number}
                  className="flex items-start gap-4"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.2 + index * 0.1, type: 'spring' }}
                >
                  {/* Number Circle */}
                  <motion.div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white flex-shrink-0"
                    style={{
                      background: step.gradient,
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    animate={{
                      boxShadow: [
                        '0 6px 20px rgba(0, 0, 0, 0.15)',
                        '0 8px 25px rgba(0, 0, 0, 0.2)',
                        '0 6px 20px rgba(0, 0, 0, 0.15)'
                      ]
                    }}
                    transition={{
                      boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    {step.number}
                  </motion.div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{step.icon}</span>
                      <h4 className="font-bold text-base" style={{ color: VIBRANT_COLORS.darkCarbon }}>
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-sm" style={{ color: VIBRANT_COLORS.mutedGray }}>
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Additional Info */}
            <motion.div
              className="mt-6 pt-4 border-t"
              style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8 }}
            >
              <p className="text-xs flex items-center gap-2" style={{ color: VIBRANT_COLORS.info.dark }}>
                <svg className="w-4 h-4" style={{ color: VIBRANT_COLORS.electricTeal }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                If a guardian doesn't respond within 48 hours, you can resend the invitation or replace them
              </p>
            </motion.div>
          </motion.div>

          {/* Enhanced Status Messages */}
          <div className="space-y-3 mb-4 mt-6">
            {currentSession.canProceed && (
              <motion.div 
                className="rounded-xl p-4 text-center"
                style={{
                  background: VIBRANT_COLORS.success.light,
                  border: `1px solid ${VIBRANT_COLORS.success.main}40`
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2, type: 'spring' }}
              >
                <p className="font-semibold" style={{ color: VIBRANT_COLORS.success.dark }}>
                  ✅ Recovery threshold met! ({acceptedCount} of {minimumNeeded} needed)
                </p>
              </motion.div>
            )}
            {!currentSession.canProceed && acceptedCount < minimumNeeded && (
              <motion.div 
                className="rounded-xl p-4 text-center"
                style={{
                  background: VIBRANT_COLORS.warning.light,
                  border: `1px solid ${VIBRANT_COLORS.warning.main}40`
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2, type: 'spring' }}
              >
                <p className="font-semibold" style={{ color: VIBRANT_COLORS.warning.dark }}>
                  ⚠️ Need at least {minimumNeeded} acceptances for recovery ({acceptedCount} so far)
                </p>
              </motion.div>
            )}
          </div>

          {/* Timeline Info */}
          <motion.div 
            className="rounded-xl p-4 text-center"
            style={{
              background: VIBRANT_COLORS.info.light,
              border: `1px solid ${VIBRANT_COLORS.electricTeal}40`
            }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <p className="font-medium" style={{ color: VIBRANT_COLORS.info.dark }}>
              💡 Most guardians respond within 2-4 hours
            </p>
          </motion.div>
        </motion.div>

        {/* Guardian List */}
        <motion.div 
          className="mx-4 sm:mx-6 mb-4 rounded-xl p-6 bg-white"
          style={{
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <motion.h3 
            className="font-medium mb-4 text-gray-900"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Guardian Status
          </motion.h3>
          <div className="space-y-3">
            {currentSession.invitations.map((invitation, index) => {
              const guardianName = (invitation as any).guardianName;
              const displayName = formatGuardianDisplay(invitation.contactInfo, guardianName);
              
              return (
                <motion.div
                  key={invitation.invitationId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <motion.div
                    className="border border-gray-100 rounded-xl p-4 bg-white transition-all duration-300"
                    style={{
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium ${
                            invitation.status === 'ACCEPTED' ? 'bg-green-500' :
                            invitation.status === 'DECLINED' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}
                        >
                          {invitation.status === 'ACCEPTED' ? '✓' : invitation.status === 'DECLINED' ? '✗' : '⏳'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {displayName}
                          </p>
                          <p className={`text-xs mt-1 truncate ${
                            invitation.status === 'ACCEPTED' ? 'text-green-600' :
                            invitation.status === 'DECLINED' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {invitation.status === 'SENT' ? (
                              <>Invited {getTimeSinceDate(invitation.sentAt)}</>
                            ) : invitation.status === 'ACCEPTED' ? (
                              <>Accepted {invitation.respondedAt ? getTimeSinceDate(invitation.respondedAt) : 'recently'}</>
                            ) : (
                              <>Declined</>
                            )}
                          </p>
                        </div>
                      </div>
                      {invitation.status === 'SENT' && (
                        <div className="px-2 py-1 rounded-full text-xs text-gray-500 bg-gray-100 flex-shrink-0 ml-2">
                          Waiting...
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* What Happens Next Section - Vibrant Design */}
        <motion.div 
          className="mx-4 sm:mx-6 mb-4 rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          {/* Dynamic gradient overlay */}
          <div 
            className="absolute inset-0 opacity-3"
            style={{
              background: `radial-gradient(circle at 20% 20%, ${VIBRANT_COLORS.electricTeal} 0%, transparent 60%)`,
            }}
          />
          
          <motion.h3 
            className="font-bold mb-6"
            style={{
              fontSize: '20px',
              color: VIBRANT_COLORS.darkCarbon,
              fontFamily: VIBRANT_TYPOGRAPHY.fonts.display
            }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.7 }}
          >
            🚀 What happens next?
          </motion.h3>
          <div className="space-y-4">
            <motion.div 
              className="flex items-start gap-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              <motion.div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${VIBRANT_COLORS.electricBlue} 0%, ${VIBRANT_COLORS.vibrantCerulean} 100%)`,
                  boxShadow: VIBRANT_SHADOWS.blueGlow
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                1
              </motion.div>
              <div>
                <p className="font-semibold" style={{ color: VIBRANT_COLORS.darkCarbon }}>Guardians receive invitation</p>
                <p className="text-sm" style={{ color: VIBRANT_COLORS.darkCarbon, opacity: 0.7 }}>They'll get an email or SMS with secure instructions</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-start gap-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.9 }}
            >
              <motion.div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${VIBRANT_COLORS.radiantOrange} 0%, ${VIBRANT_COLORS.electricYellow} 100%)`,
                  boxShadow: VIBRANT_SHADOWS.orangeGlow
                }}
                whileHover={{ scale: 1.1, rotate: -5 }}
              >
                2
              </motion.div>
              <div>
                <p className="font-semibold" style={{ color: VIBRANT_COLORS.darkCarbon }}>They accept or decline</p>
                <p className="text-sm" style={{ color: VIBRANT_COLORS.darkCarbon, opacity: 0.7 }}>Most respond within 2-4 hours</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-start gap-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 2.0 }}
            >
              <motion.div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${VIBRANT_COLORS.vibrantEmerald} 0%, ${VIBRANT_COLORS.electricLime} 100%)`,
                  boxShadow: VIBRANT_SHADOWS.greenGlow
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{
                  boxShadow: [
                    VIBRANT_SHADOWS.greenGlow,
                    '0px 4px 12px rgba(0, 230, 118, 0.3), 0px 2px 6px rgba(110, 255, 0, 0.25)',
                    VIBRANT_SHADOWS.greenGlow
                  ]
                }}
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                3
              </motion.div>
              <div>
                <p className="font-semibold" style={{ color: VIBRANT_COLORS.darkCarbon }}>Setup completes automatically</p>
                <p className="text-sm" style={{ color: VIBRANT_COLORS.darkCarbon, opacity: 0.7 }}>Need at least {minimumNeeded} acceptances for recovery</p>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Tip with gradient */}
          <motion.div 
            className="mt-6 p-4 rounded-xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${VIBRANT_COLORS.warning.light} 0%, rgba(255, 215, 0, 0.1) 100%)`,
              border: `1px solid ${VIBRANT_COLORS.electricYellow}40`
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.1, type: 'spring' }}
          >
            <motion.div
              className="absolute top-2 right-2 text-xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💡
            </motion.div>
            <p className="font-medium" style={{ color: VIBRANT_COLORS.warning.dark }}>
              <strong>Pro Tip:</strong> You can contact your guardians directly to remind them about the invitation
            </p>
          </motion.div>
        </motion.div>

        {/* Enhanced Actions Section */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3">
          {/* Dynamic Refresh Button with Vibrant Design */}
          <motion.div 
            className="flex items-center justify-between mb-4 p-3 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: VIBRANT_COLORS.vibrantEmerald }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="text-sm font-medium" style={{ color: VIBRANT_COLORS.darkCarbon }}>
                Last updated: {formatLastRefresh()}
              </span>
            </div>
            <motion.button
              onClick={handleRefresh}
              disabled={isRefetching}
              className="px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2"
              style={{
                background: isRefetching 
                  ? `linear-gradient(135deg, ${VIBRANT_COLORS.electricBlue}40 0%, ${VIBRANT_COLORS.electricTeal}40 100%)`
                  : `linear-gradient(135deg, ${VIBRANT_COLORS.electricBlue} 0%, ${VIBRANT_COLORS.electricTeal} 100%)`,
                color: VIBRANT_COLORS.pureWhite,
                boxShadow: isRefetching ? 'none' : VIBRANT_SHADOWS.blueGlow
              }}
              whileHover={{ scale: isRefetching ? 1 : 1.05 }}
              whileTap={{ scale: isRefetching ? 1 : 0.95 }}
            >
              <motion.svg 
                className="w-4 h-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                animate={isRefetching ? { rotate: 360 } : {}}
                transition={isRefetching ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </motion.svg>
              {isRefetching ? 'Refreshing...' : 'Refresh'}
            </motion.button>
          </motion.div>

          {/* Enhanced Proceed Button when ready - Reduced glare */}
          {stillWaitingFor === 0 && currentSession.canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <motion.div 
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${VIBRANT_COLORS.success.main}30`,
                  boxShadow: '0 4px 15px rgba(0, 200, 83, 0.15)'
                }}
                whileHover={{ scale: 1.01 }}
              >
                {/* Subtle celebration animation background */}
                <div className="absolute inset-0 opacity-5">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{
                        background: VIBRANT_COLORS.success.main,
                        left: `${30 + i * 20}%`,
                        top: `${30 + i * 10}%`,
                      }}
                      animate={{
                        y: [-5, -15, -5],
                        opacity: [0.3, 0.6, 0.3],
                        scale: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.span 
                      className="text-xl"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 3 }}
                    >
                      🎉
                    </motion.span>
                    <p className="font-semibold text-lg" style={{ color: VIBRANT_COLORS.darkCarbon }}>
                      All guardians responded! Ready to complete setup.
                    </p>
                  </div>
                  <motion.div 
                    className="rounded-lg p-3 mb-4"
                    style={{
                      background: 'rgba(224, 255, 255, 0.3)',
                      border: `1px solid ${VIBRANT_COLORS.electricTeal}20`
                    }}
                    initial={{ scale: 0.98 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-sm" style={{ color: VIBRANT_COLORS.darkCarbon, opacity: 0.8 }}>
                      🔐 <strong>Security:</strong> Your recovery secret will be encrypted with zero-knowledge architecture using your master password
                    </p>
                  </motion.div>
                  <ModernButton 
                    onClick={handleCompleteSetup}
                    loading={distributeMutation.isPending}
                    fullWidth
                    size="lg"
                    variant="success"
                    icon={
                      !distributeMutation.isPending && (
                        <motion.div
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </motion.div>
                      )
                    }
                  >
                    {distributeMutation.isPending ? 'Generating Encrypted Shares...' : 'Complete Setup'}
                  </ModernButton>
                  {distributeMutation.isPending && (
                    <motion.p 
                      className="text-sm mt-3 text-center"
                      style={{ color: VIBRANT_COLORS.success.main, opacity: 0.8 }}
                      animate={{ opacity: [0.6, 0.9, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Creating encrypted shares with dual-salt security...
                    </motion.p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Enhanced Not enough acceptances warning */}
          {stillWaitingFor === 0 && !currentSession.canProceed && (
            <motion.div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${VIBRANT_COLORS.error.light} 0%, rgba(255, 77, 77, 0.1) 100%)`,
                border: `2px solid ${VIBRANT_COLORS.vibrantScarlet}40`,
                boxShadow: '0 8px 25px rgba(255, 77, 77, 0.2)'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              {/* Warning animation */}
              <motion.div
                className="absolute top-4 right-4 text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⚠️
              </motion.div>
              
              <p className="font-bold text-lg mb-3" style={{ color: VIBRANT_COLORS.error.dark }}>
                ❌ Not enough acceptances
              </p>
              <p className="font-medium mb-4" style={{ color: VIBRANT_COLORS.error.dark, opacity: 0.9 }}>
                You received {acceptedCount} acceptance{acceptedCount !== 1 ? 's' : ''} but need at least {minimumNeeded} for recovery. 
                Please invite more guardians.
              </p>
              <ModernButton 
                onClick={() => navigate('/improved-guardian-setup')}
                fullWidth
                size="lg"
                variant="secondary"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Invite More Guardians
              </ModernButton>
            </motion.div>
          )}

          {/* Enhanced Decline handling */}
          {currentSession.status === 'SOME_DECLINED' && currentSession.statistics.declinedCount > 0 && (
            <motion.div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${VIBRANT_COLORS.warning.light} 0%, rgba(255, 179, 0, 0.1) 100%)`,
                border: `2px solid ${VIBRANT_COLORS.radiantOrange}40`,
                boxShadow: VIBRANT_SHADOWS.orangeGlow
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle, ${VIBRANT_COLORS.radiantOrange} 0%, transparent 70%)`,
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              <div className="relative">
                <p className="font-bold text-lg mb-3" style={{ color: VIBRANT_COLORS.warning.dark }}>
                  ⚠️ {currentSession.statistics.declinedCount} guardian{currentSession.statistics.declinedCount > 1 ? 's' : ''} declined
                </p>
                <p className="font-medium mb-4" style={{ color: VIBRANT_COLORS.warning.dark, opacity: 0.9 }}>
                  You may need to invite additional guardians to meet your threshold.
                </p>
                <ModernButton 
                  onClick={() => navigate('/improved-guardian-setup')}
                  fullWidth
                  size="lg"
                  variant="secondary"
                  icon={
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </motion.div>
                  }
                >
                  Add More Guardians
                </ModernButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Master Password Modal */}
      <AnimatePresence>
        {showPasswordPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md relative overflow-hidden"
              style={{
                boxShadow: VIBRANT_SHADOWS.cardHover,
              }}
            >
              {/* Subtle gradient overlay */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  background: `radial-gradient(circle at top right, ${VIBRANT_COLORS.electricBlue} 0%, transparent 50%)`,
                }}
              />
              
              <div className="relative text-center mb-6">
                <motion.div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: VIBRANT_GRADIENTS.primaryAction,
                    boxShadow: VIBRANT_SHADOWS.blueGlow,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-black mb-2" style={{ 
                  fontFamily: VIBRANT_TYPOGRAPHY.fonts.display,
                  color: VIBRANT_COLORS.darkCarbon 
                }}>
                  Enter Master Password
                </h3>
                <p className="text-sm" style={{ color: VIBRANT_COLORS.mutedGray }}>
                  Your master password is needed to encrypt recovery shares with zero-knowledge security.
                </p>
              </div>

              <div className="relative space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: VIBRANT_COLORS.darkCarbon }}>
                    Master Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={masterPassword}
                      onChange={(e) => {
                        setMasterPassword(e.target.value);
                        setPasswordError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !confirmPassword) {
                          document.getElementById('confirmPassword')?.focus();
                        }
                      }}
                      placeholder="Enter your secure master password"
                      className="w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-300"
                      style={{
                        borderColor: passwordError ? VIBRANT_COLORS.vibrantScarlet : '#E5E7EB',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '16px',
                      }}
                      onFocus={(e) => {
                        if (!passwordError) {
                          e.target.style.borderColor = VIBRANT_COLORS.electricBlue;
                          e.target.style.boxShadow = VIBRANT_SHADOWS.blueGlow;
                        }
                      }}
                      onBlur={(e) => {
                        if (!passwordError) {
                          e.target.style.borderColor = '#E5E7EB';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200"
                      style={{ color: VIBRANT_COLORS.mutedGray }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = VIBRANT_COLORS.electricBlue;
                        e.currentTarget.style.backgroundColor = 'rgba(0, 163, 255, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = VIBRANT_COLORS.mutedGray;
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: VIBRANT_COLORS.darkCarbon }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handlePasswordSubmit();
                        }
                      }}
                      placeholder="Confirm your master password"
                      className="w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-300"
                      style={{
                        borderColor: passwordError ? VIBRANT_COLORS.vibrantScarlet : '#E5E7EB',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '16px',
                      }}
                      onFocus={(e) => {
                        if (!passwordError) {
                          e.target.style.borderColor = VIBRANT_COLORS.electricBlue;
                          e.target.style.boxShadow = VIBRANT_SHADOWS.blueGlow;
                        }
                      }}
                      onBlur={(e) => {
                        if (!passwordError) {
                          e.target.style.borderColor = '#E5E7EB';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200"
                      style={{ color: VIBRANT_COLORS.mutedGray }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = VIBRANT_COLORS.electricBlue;
                        e.currentTarget.style.backgroundColor = 'rgba(0, 163, 255, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = VIBRANT_COLORS.mutedGray;
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs mt-2 flex items-center gap-1"
                      style={{ color: VIBRANT_COLORS.vibrantScarlet }}
                    >
                      <AlertCircle className="w-4 h-4" />
                      {passwordError}
                    </motion.p>
                  )}
                </div>

                <motion.div 
                  className="rounded-xl p-4"
                  style={{
                    background: `linear-gradient(135deg, ${VIBRANT_COLORS.info.light} 0%, rgba(224, 255, 255, 0.6) 100%)`,
                    border: `1px solid ${VIBRANT_COLORS.electricTeal}40`,
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-xs" style={{ color: VIBRANT_COLORS.info.dark }}>
                    <strong>Requirements:</strong> 12+ characters with uppercase, lowercase, numbers, and special characters
                  </p>
                </motion.div>

                <div className="flex space-x-3">
                  <ModernButton
                    variant="ghost"
                    onClick={() => {
                      setShowPasswordPrompt(false);
                      setMasterPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                      setShowPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    fullWidth
                  >
                    Cancel
                  </ModernButton>
                  <ModernButton
                    onClick={handlePasswordSubmit}
                    fullWidth
                    disabled={!masterPassword.trim() || !confirmPassword.trim()}
                    variant="primary"
                  >
                    Continue
                  </ModernButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation */}
      <SuccessComponent />
    </div>
  );
};
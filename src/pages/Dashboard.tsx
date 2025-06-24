import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { guardianApi } from '../api/guardian';
import { AnimatedShield } from '../components/ui/AnimatedShield';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { VIBRANT_COLORS, VIBRANT_GRADIENTS, VIBRANT_SHADOWS, VIBRANT_TYPOGRAPHY } from '../constants/vibrant-design-system';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { email } = useAuth();

  // Query current session
  const { data: currentSession, isLoading: sessionLoading, error: sessionError } = useQuery({
    queryKey: ['currentSession'],
    queryFn: () => guardianApi.getCurrentSession(),
    retry: false
  });

  // Query guardians
  const { data: guardiansData, isLoading: guardiansLoading, error: guardiansError } = useQuery({
    queryKey: ['guardians'],
    queryFn: () => guardianApi.getGuardians(),
    retry: false
  });


  if (sessionLoading || guardiansLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error if both queries failed
  if (sessionError && guardiansError) {
    return (
      <div className="h-full flex items-center justify-center px-4 sm:px-6">
        <Card className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to load dashboard data. Please check if the backend is running.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Session Error: {sessionError?.message}<br/>
            Guardians Error: {guardiansError?.message}
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const guardians = guardiansData?.data || [];
  const hasGuardians = guardians.length > 0;

  // If user has guardians and no active session, redirect to GuardianDashboard
  if (hasGuardians && (!currentSession || currentSession.status === 'COMPLETED')) {
    navigate('/guardian-dashboard', { replace: true });
    return null;
  }

  // Show session status if active (but not completed) - Vibrant Design
  if (currentSession && currentSession.status !== 'COMPLETED') {
    const acceptedCount = currentSession.statistics.acceptedCount;
    const totalInvitations = currentSession.statistics.totalInvitations;
    const stillWaitingFor = totalInvitations - acceptedCount - (currentSession.statistics.declinedCount || 0);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='flex flex-col h-full relative'
        style={{
          background: VIBRANT_GRADIENTS.lightBackground,
        }}
      >
        {/* Dynamic background particles */}
        <div className='absolute inset-0 overflow-hidden'>
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className='absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full'
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(1px)',
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
                y: [-10, 10, -10],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 space-y-6 p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Enhanced Active Session Status */}
          <motion.div
            className="rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
          >
            {/* Status indicator glow */}
            <div 
              className="absolute top-0 left-0 w-full h-1 rounded-t-3xl"
              style={{
                background: currentSession.status === 'ALL_ACCEPTED' 
                  ? `linear-gradient(90deg, ${VIBRANT_COLORS.vibrantEmerald} 0%, ${VIBRANT_COLORS.electricLime} 100%)`
                  : currentSession.status === 'WAITING_FOR_ALL'
                    ? `linear-gradient(90deg, ${VIBRANT_COLORS.electricBlue} 0%, ${VIBRANT_COLORS.electricTeal} 100%)`
                    : `linear-gradient(90deg, ${VIBRANT_COLORS.radiantOrange} 0%, ${VIBRANT_COLORS.vibrantScarlet} 100%)`
              }}
            />
            
            <div className="flex items-center justify-between mb-6">
              <motion.h2 
                className="font-black"
                style={{
                  fontSize: '24px',
                  color: VIBRANT_COLORS.darkCarbon,
                  fontFamily: VIBRANT_TYPOGRAPHY.fonts.display
                }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                🚀 Active Session
              </motion.h2>
              <motion.span 
                className="px-4 py-2 rounded-xl font-bold text-sm"
                style={{
                  background: currentSession.status === 'ALL_ACCEPTED' 
                    ? `linear-gradient(135deg, ${VIBRANT_COLORS.vibrantEmerald} 0%, ${VIBRANT_COLORS.electricLime} 100%)`
                    : currentSession.status === 'WAITING_FOR_ALL'
                      ? `linear-gradient(135deg, ${VIBRANT_COLORS.electricBlue} 0%, ${VIBRANT_COLORS.electricTeal} 100%)`
                      : `linear-gradient(135deg, ${VIBRANT_COLORS.radiantOrange} 0%, ${VIBRANT_COLORS.vibrantScarlet} 100%)`,
                  color: VIBRANT_COLORS.pureWhite,
                  boxShadow: currentSession.status === 'ALL_ACCEPTED' 
                    ? VIBRANT_SHADOWS.successGlow
                    : currentSession.status === 'WAITING_FOR_ALL'
                      ? VIBRANT_SHADOWS.blueGlow
                      : VIBRANT_SHADOWS.orangeGlow
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                whileHover={{ scale: 1.05 }}
              >
                {currentSession.status.replace(/_/g, ' ')}
              </motion.span>
            </div>
            
            <motion.p 
              className="font-medium mb-6"
              style={{ 
                color: VIBRANT_COLORS.darkCarbon,
                fontSize: '16px'
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Your guardian network is securing your wallet.
              {currentSession.status === 'ALL_ACCEPTED' && ' 🎉 All guardians have accepted!'}
              {currentSession.status === 'WAITING_FOR_ALL' && ` ⏳ Waiting for ${stillWaitingFor} more response${stillWaitingFor !== 1 ? 's' : ''}...`}
              {currentSession.status === 'SOME_DECLINED' && ' ⚠️ Some guardians have declined.'}
            </motion.p>

            <div className="space-y-4">
              {currentSession.status === 'ALL_ACCEPTED' ? (
                <>
                  <motion.div 
                    className="rounded-2xl p-6 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${VIBRANT_COLORS.success.light} 0%, rgba(0, 230, 118, 0.1) 100%)`,
                      border: `2px solid ${VIBRANT_COLORS.vibrantEmerald}40`
                    }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                  >
                    {/* Celebration particles */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full"
                          style={{
                            background: VIBRANT_COLORS.vibrantEmerald,
                            left: `${20 + i * 12}%`,
                            top: `${30 + (i % 2) * 20}%`,
                          }}
                          animate={{
                            y: [-8, -20, -8],
                            opacity: [0.3, 1, 0.3],
                            scale: [0.5, 1.2, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                    <div className="relative flex items-center space-x-3 mb-3">
                      <motion.span 
                        className="text-2xl"
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                      >
                        🎉
                      </motion.span>
                      <p className="font-bold text-lg" style={{ color: VIBRANT_COLORS.success.dark }}>
                        Ready to complete setup!
                      </p>
                    </div>
                    <p className="font-medium" style={{ color: VIBRANT_COLORS.success.dark, opacity: 0.9 }}>
                      All guardians have accepted. Complete your setup to secure your wallet.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      onClick={() => navigate('/session-monitoring')}
                      className="w-full px-6 py-4 rounded-xl font-bold text-white relative overflow-hidden transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${VIBRANT_COLORS.vibrantEmerald} 0%, ${VIBRANT_COLORS.electricLime} 100%)`,
                        boxShadow: VIBRANT_SHADOWS.successGlow,
                        fontSize: '18px'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center justify-center gap-3">
                        Complete Setup Now
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.div>
                      </span>
                    </motion.button>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    onClick={() => navigate('/session-monitoring')}
                    className="w-full px-6 py-4 rounded-xl font-bold text-white relative overflow-hidden transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${VIBRANT_COLORS.electricBlue} 0%, ${VIBRANT_COLORS.electricTeal} 100%)`,
                      boxShadow: VIBRANT_SHADOWS.blueGlow,
                      fontSize: '16px'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Session Status
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              className="rounded-2xl p-6 text-center relative overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: VIBRANT_SHADOWS.cardFloat,
                border: '1px solid rgba(0, 163, 255, 0.2)'
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
            >
              <div 
                className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
                style={{
                  background: `linear-gradient(90deg, ${VIBRANT_COLORS.electricBlue} 0%, ${VIBRANT_COLORS.electricTeal} 100%)`
                }}
              />
              <motion.div 
                className="font-black mb-2"
                style={{
                  fontSize: '28px',
                  color: VIBRANT_COLORS.electricBlue,
                  fontFamily: VIBRANT_TYPOGRAPHY.fonts.display
                }}
                whileHover={{ scale: 1.1 }}
              >
                {currentSession.statistics.totalInvitations}
              </motion.div>
              <div className="font-medium" style={{ color: VIBRANT_COLORS.darkCarbon }}>Total Guardians</div>
            </motion.div>
            <motion.div
              className="rounded-2xl p-6 text-center relative overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: VIBRANT_SHADOWS.cardFloat,
                border: '1px solid rgba(0, 230, 118, 0.2)'
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
            >
              <div 
                className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
                style={{
                  background: `linear-gradient(90deg, ${VIBRANT_COLORS.vibrantEmerald} 0%, ${VIBRANT_COLORS.electricLime} 100%)`
                }}
              />
              <motion.div 
                className="font-black mb-2"
                style={{
                  fontSize: '28px',
                  color: VIBRANT_COLORS.vibrantEmerald,
                  fontFamily: VIBRANT_TYPOGRAPHY.fonts.display
                }}
                whileHover={{ scale: 1.1 }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {currentSession.statistics.acceptedCount}
              </motion.div>
              <div className="font-medium" style={{ color: VIBRANT_COLORS.darkCarbon }}>Accepted</div>
            </motion.div>
          </div>

          {/* Enhanced Session Details */}
          <motion.div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: VIBRANT_SHADOWS.cardFloat,
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <motion.h3 
              className="font-bold mb-6"
              style={{
                fontSize: '20px',
                color: VIBRANT_COLORS.darkCarbon,
                fontFamily: VIBRANT_TYPOGRAPHY.fonts.display
              }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              📊 Session Details
            </motion.h3>
            <div className="space-y-4">
              <motion.div 
                className="flex justify-between items-center p-3 rounded-xl"
                style={{ background: VIBRANT_COLORS.lightGrey }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <span className="font-medium" style={{ color: VIBRANT_COLORS.darkCarbon }}>Minimum Required:</span>
                <span className="font-bold" style={{ color: VIBRANT_COLORS.electricBlue }}>
                  {currentSession.minimumAcceptances} guardians
                </span>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center p-3 rounded-xl"
                style={{ background: VIBRANT_COLORS.lightGrey }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <span className="font-medium" style={{ color: VIBRANT_COLORS.darkCarbon }}>Can Proceed:</span>
                <motion.span 
                  className="font-bold flex items-center gap-2"
                  style={{ 
                    color: currentSession.canProceed ? VIBRANT_COLORS.vibrantEmerald : VIBRANT_COLORS.vibrantScarlet
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  {currentSession.canProceed ? '✅ Yes' : '❌ No'}
                </motion.span>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center p-3 rounded-xl"
                style={{ background: VIBRANT_COLORS.lightGrey }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                <span className="font-medium" style={{ color: VIBRANT_COLORS.darkCarbon }}>Created:</span>
                <span className="font-bold" style={{ color: VIBRANT_COLORS.darkCarbon }}>
                  {new Date(currentSession.createdAt).toLocaleDateString()}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }


  // Show empty state if no guardians (vibrant design)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 relative overflow-hidden'
      style={{
        background: VIBRANT_GRADIENTS.cosmicNebula,
      }}
    >
      {/* Animated background particles */}
      <div className='absolute inset-0 overflow-hidden'>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className='absolute w-1 h-1 bg-white rounded-full'
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(1px)',
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Animated Shield with enhanced glow and depth */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 100 }}
        className='mb-8 relative'
        style={{ zIndex: 10 }}
      >
        {/* Multiple glow layers for depth */}
        <div 
          className='absolute inset-0 blur-3xl'
          style={{
            background: `radial-gradient(circle, ${VIBRANT_COLORS.glowGreen}40 0%, ${VIBRANT_COLORS.electricBlue}30 40%, transparent 70%)`,
            transform: 'scale(1.8)',
          }}
        />
        <div 
          className='absolute inset-0 blur-2xl'
          style={{
            background: `radial-gradient(circle, ${VIBRANT_COLORS.electricBlue}50 0%, transparent 60%)`,
            transform: 'scale(1.4)',
          }}
        />
        {/* Pulsing effect */}
        <motion.div 
          className='absolute inset-0'
          style={{
            background: `radial-gradient(circle, ${VIBRANT_COLORS.pureWhite}10 0%, transparent 50%)`,
            transform: 'scale(1.2)',
          }}
          animate={{
            scale: [1.2, 1.5, 1.2],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <AnimatedShield size={280} />
      </motion.div>

      {/* Headline with gradient */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className='mb-4 relative'
        style={{
          fontSize: window.innerWidth < 640 ? VIBRANT_TYPOGRAPHY.sizes.display.mobile : VIBRANT_TYPOGRAPHY.sizes.display.size,
          lineHeight: VIBRANT_TYPOGRAPHY.sizes.display.lineHeight,
          fontWeight: VIBRANT_TYPOGRAPHY.weights.black,
          fontFamily: VIBRANT_TYPOGRAPHY.fonts.display,
          background: VIBRANT_GRADIENTS.headlineGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 1px 5px rgba(255, 255, 255, 0.1)',
        }}
      >
        Secure Your Wallet with Guardians
      </motion.h1>

      {/* Sub-headline */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className='mb-10 max-w-md'
        style={{
          fontSize: VIBRANT_TYPOGRAPHY.sizes.body.size,
          fontWeight: VIBRANT_TYPOGRAPHY.weights.medium,
          color: VIBRANT_COLORS.softWhite,
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
        }}
      >
        Replace complex seed phrases with trusted friends & family
      </motion.p>

      {/* CTA Button with vibrant gradient */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className='w-full max-w-xs relative'
      >
        <motion.button
          onClick={() => navigate('/setup')}
          className='w-full px-6 py-3 rounded-xl font-bold text-white relative overflow-hidden transition-all duration-300'
          style={{
            background: VIBRANT_GRADIENTS.primaryAction,
            boxShadow: VIBRANT_SHADOWS.primaryGlow,
            fontSize: VIBRANT_TYPOGRAPHY.sizes.body.size,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span 
            className='relative z-10 flex items-center justify-center gap-2'
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            Start Guardian Setup
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M13 7l5 5m0 0l-5 5m5-5H6' />
            </svg>
          </motion.span>
          
          {/* Hover ripple effect */}
          <motion.div
            className='absolute inset-0 opacity-0'
            style={{
              background: `radial-gradient(circle, ${VIBRANT_COLORS.electricIndigo} 0%, transparent 70%)`,
            }}
            whileHover={{ opacity: 0.3 }}
          />
        </motion.button>
      </motion.div>

      {/* User email - subtle placement */}
      {email && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className='mt-8 text-sm'
          style={{
            color: VIBRANT_COLORS.softWhite,
            opacity: 0.7,
          }}
        >
          {email}
        </motion.p>
      )}
    </motion.div>
  );
};
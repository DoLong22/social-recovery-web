import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { guardianApi } from '../api/guardian';
import { AnimatedShield } from '../components/ui/AnimatedShield';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  VIBRANT_COLORS,
  VIBRANT_GRADIENTS,
  VIBRANT_SHADOWS,
  VIBRANT_TYPOGRAPHY,
} from '../constants/vibrant-design-system';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { email } = useAuth();

  // Query current session
  const {
    data: currentSession,
    isLoading: sessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ['currentSession'],
    queryFn: () => guardianApi.getCurrentSession(),
    retry: false,
  });

  // Query guardians
  const {
    data: guardiansData,
    isLoading: guardiansLoading,
    error: guardiansError,
  } = useQuery({
    queryKey: ['guardians'],
    queryFn: () => guardianApi.getGuardians(),
    retry: false,
  });

  if (sessionLoading || guardiansLoading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  // Show error if both queries failed
  if (sessionError && guardiansError) {
    return (
      <div className='h-full flex items-center justify-center px-4 sm:px-6'>
        <Card className='text-center'>
          <h2 className='text-lg font-semibold text-red-600 mb-2'>
            Connection Error
          </h2>
          <p className='text-gray-600 mb-4'>
            Unable to load dashboard data. Please check if the backend is
            running.
          </p>
          <p className='text-sm text-gray-500 mb-4'>
            Session Error: {sessionError?.message}
            <br />
            Guardians Error: {guardiansError?.message}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  const guardians = guardiansData?.data || [];
  const hasGuardians = guardians.length > 0;

  // If user has guardians and no active session, redirect to GuardianDashboard
  if (
    hasGuardians &&
    (!currentSession || currentSession.status === 'COMPLETED')
  ) {
    navigate('/guardian-dashboard', { replace: true });
    return null;
  }

  // Show session status if active (but not completed) - Vibrant Design
  if (currentSession && currentSession.status !== 'COMPLETED') {
    const acceptedCount = currentSession.statistics.acceptedCount;
    const totalInvitations = currentSession.statistics.totalInvitations;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='flex flex-col h-full relative overflow-hidden'
        style={{
          background: `linear-gradient(135deg, #1A0033 0%, #6A0DAD 100%)`,
        }}
      >
        {/* Command Center Geometric Pattern */}
        <div className='absolute inset-0 overflow-hidden'>
          {/* Subtle mesh overlay */}
          <div
            className='absolute inset-0 opacity-10'
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, ${VIBRANT_COLORS.electricBlue} 0%, transparent 50%),
                radial-gradient(circle at 75% 25%, ${VIBRANT_COLORS.neonPurple} 0%, transparent 50%),
                radial-gradient(circle at 25% 75%, ${VIBRANT_COLORS.electricTeal} 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, ${VIBRANT_COLORS.deepViolet} 0%, transparent 50%)
              `,
            }}
          />

          {/* Flowing light trails */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className='absolute w-px h-20 bg-gradient-to-b from-transparent via-white to-transparent opacity-20'
              style={{
                left: `${10 + i * 12}%`,
                top: `-10%`,
              }}
              animate={{
                y: ['-10%', '110%'],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: 'linear',
              }}
            />
          ))}

          {/* Floating tech particles */}
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
                opacity: [0.1, 0.6, 0.1],
                scale: [0.5, 1.2, 0.5],
                y: [-15, 15, -15],
                x: [-10, 10, -10],
              }}
              transition={{
                duration: 6 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Header - Command Center Style */}
        <motion.div
          className='px-4 sm:px-6 py-4 border-b border-white/10 relative'
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className='flex items-center justify-between'>
            <div>
              <h1
                className='font-black text-white text-xl'
                style={{ fontFamily: VIBRANT_TYPOGRAPHY.fonts.display }}
              >
                Guardian Dashboard
              </h1>
              <p className='text-white/70 text-sm font-medium'>{email}</p>
            </div>
            <motion.div
              className='w-3 h-3 rounded-full'
              style={{ background: VIBRANT_COLORS.vibrantEmerald }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </motion.div>

        <div className='relative z-10 space-y-6 p-4 sm:p-6 overflow-y-auto flex-1'>
          {/* Active Session - Hero Command Card */}
          <motion.div
            className='rounded-3xl p-8 relative overflow-hidden'
            style={{
              background:
                currentSession.status === 'ALL_ACCEPTED'
                  ? `linear-gradient(135deg, ${VIBRANT_COLORS.vibrantEmerald} 0%, ${VIBRANT_COLORS.electricLime} 100%)`
                  : `linear-gradient(135deg, ${VIBRANT_COLORS.electricBlue} 0%, ${VIBRANT_COLORS.neonPurple} 100%)`,
              boxShadow:
                currentSession.status === 'ALL_ACCEPTED'
                  ? '0 25px 50px rgba(0, 230, 118, 0.4), 0 12px 30px rgba(0, 230, 118, 0.2)'
                  : '0 25px 50px rgba(163, 0, 255, 0.4), 0 12px 30px rgba(0, 163, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Status indicator glow */}
            <div
              className='absolute top-0 left-0 w-full h-1 rounded-t-3xl'
              style={{
                background:
                  currentSession.status === 'ALL_ACCEPTED'
                    ? `linear-gradient(90deg, ${VIBRANT_COLORS.vibrantEmerald} 0%, ${VIBRANT_COLORS.electricLime} 100%)`
                    : currentSession.status === 'WAITING_FOR_ALL'
                    ? `linear-gradient(90deg, ${VIBRANT_COLORS.electricBlue} 0%, ${VIBRANT_COLORS.electricTeal} 100%)`
                    : `linear-gradient(90deg, ${VIBRANT_COLORS.radiantOrange} 0%, ${VIBRANT_COLORS.vibrantScarlet} 100%)`,
              }}
            />

            {/* Animated shield/lock icon for active status */}
            <motion.div
              className='absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center'
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
              }}
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <svg
                className='w-7 h-7 text-white'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2.5}
                  d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                />
              </svg>
            </motion.div>

            <div className='mb-6'>
              <motion.h2
                className='font-black text-white mb-2'
                style={{
                  fontSize: '32px',
                  fontFamily: VIBRANT_TYPOGRAPHY.fonts.display,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {currentSession.status === 'ALL_ACCEPTED'
                  ? 'Wallet Protected'
                  : 'Active Session'}
              </motion.h2>

              <motion.div
                className='flex items-center gap-3'
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.span
                  className='px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2'
                  style={{
                    background:
                      currentSession.status === 'ALL_ACCEPTED'
                        ? 'rgba(255, 255, 255, 0.25)'
                        : currentSession.status === 'WAITING_FOR_ALL'
                        ? 'rgba(255, 127, 0, 0.9)'
                        : 'rgba(255, 77, 77, 0.9)',
                    color: VIBRANT_COLORS.pureWhite,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                  animate={
                    currentSession.status === 'WAITING_FOR_ALL'
                      ? {
                          scale: [1, 1.05, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {currentSession.status === 'ALL_ACCEPTED' && '✅ ACTIVE'}
                  {currentSession.status === 'WAITING_FOR_ALL' && (
                    <>
                      <motion.div
                        className='w-2 h-2 rounded-full bg-white'
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                      WAITING FOR ALL
                    </>
                  )}
                  {currentSession.status === 'SOME_DECLINED' &&
                    '⚠️ SOME DECLINED'}
                </motion.span>
              </motion.div>
            </div>

            <motion.p
              className='font-medium mb-6 text-white/90'
              style={{
                fontSize: '16px',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {currentSession.status === 'ALL_ACCEPTED' && (
                <span className='flex items-center gap-2'>
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    🎉
                  </motion.span>
                  {acceptedCount} Active Guardians • Your wallet is fully
                  secured
                </span>
              )}
              {currentSession.status === 'WAITING_FOR_ALL' && (
                <span className='flex items-center gap-2'>
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    ⏳
                  </motion.span>
                  You have an active guardian setup session waiting for
                  responses
                </span>
              )}
              {currentSession.status === 'SOME_DECLINED' && (
                <span className='flex items-center gap-2'>
                  ⚠️ {currentSession.statistics.declinedCount} guardian
                  {currentSession.statistics.declinedCount > 1 ? 's' : ''}{' '}
                  declined • Add more guardians to meet threshold
                </span>
              )}
            </motion.p>

            <div className='space-y-4'>
              {currentSession.status === 'ALL_ACCEPTED' ? (
                <>
                  <motion.div
                    className='rounded-2xl p-6 relative overflow-hidden'
                    style={{
                      background: `linear-gradient(135deg, ${VIBRANT_COLORS.success.light} 0%, rgba(0, 230, 118, 0.1) 100%)`,
                      border: `2px solid ${VIBRANT_COLORS.vibrantEmerald}40`,
                      color: VIBRANT_COLORS.pureWhite,
                      backdropFilter: 'blur(10px)',
                    }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                  >
                    {/* Celebration particles */}
                    <div className='absolute inset-0 overflow-hidden'>
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className='absolute w-1.5 h-1.5 rounded-full'
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
                    <div className='relative flex items-center space-x-3 mb-3'>
                      <motion.span
                        className='text-2xl'
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                      >
                        🎉
                      </motion.span>
                      <p
                        className='font-bold text-lg'
                        style={{ color: VIBRANT_COLORS.success.dark }}
                      >
                        Ready to complete setup!
                      </p>
                    </div>
                    <p
                      className='font-medium'
                      style={{
                        color: VIBRANT_COLORS.success.dark,
                        opacity: 0.9,
                      }}
                    >
                      All guardians have accepted. Complete your setup to secure
                      your wallet.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      onClick={() => navigate('/session-monitoring')}
                      className='w-full px-6 py-4 rounded-xl font-bold text-white relative overflow-hidden transition-all duration-300'
                      style={{
                        background: `linear-gradient(135deg, ${VIBRANT_COLORS.vibrantEmerald} 0%, ${VIBRANT_COLORS.electricLime} 100%)`,
                        boxShadow: VIBRANT_SHADOWS.successGlow,
                        fontSize: '18px',
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className='flex items-center justify-center gap-3'>
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
                    className='w-full px-6 py-4 rounded-xl font-bold text-white relative overflow-hidden transition-all duration-300'
                    style={{
                      background: `linear-gradient(135deg, ${VIBRANT_COLORS.electricBlue} 0%, ${VIBRANT_COLORS.electricTeal} 100%)`,
                      boxShadow: VIBRANT_SHADOWS.blueGlow,
                      fontSize: '16px',
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

          {/* Command Center Status Metrics */}
          <div className='grid grid-cols-2 gap-4'>
            <motion.div
              className='rounded-2xl p-6 text-center relative overflow-hidden'
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: `1px solid ${VIBRANT_COLORS.electricBlue}40`,
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 12px 40px rgba(0, 163, 255, 0.4)',
              }}
            >
              {/* Glowing border */}
              <div
                className='absolute top-0 left-0 w-full h-1 rounded-t-2xl'
                style={{
                  background: `linear-gradient(90deg, ${VIBRANT_COLORS.electricBlue} 0%, ${VIBRANT_COLORS.electricTeal} 100%)`,
                }}
              />
              <motion.div
                className='font-black mb-2 text-white'
                style={{
                  fontSize: '32px',
                  fontFamily: VIBRANT_TYPOGRAPHY.fonts.display,
                  textShadow: '0 2px 10px rgba(0, 163, 255, 0.5)',
                }}
                whileHover={{ scale: 1.1 }}
                animate={{
                  textShadow: [
                    '0 2px 10px rgba(0, 163, 255, 0.5)',
                    '0 2px 15px rgba(0, 163, 255, 0.8)',
                    '0 2px 10px rgba(0, 163, 255, 0.5)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {currentSession.statistics.totalInvitations}
              </motion.div>
              <div className='font-medium text-white/80'>Total Guardians</div>
            </motion.div>

            <motion.div
              className='rounded-2xl p-6 text-center relative overflow-hidden'
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: `1px solid ${VIBRANT_COLORS.vibrantEmerald}40`,
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 12px 40px rgba(0, 230, 118, 0.4)',
              }}
            >
              {/* Glowing border */}
              <div
                className='absolute top-0 left-0 w-full h-1 rounded-t-2xl'
                style={{
                  background: `linear-gradient(90deg, ${VIBRANT_COLORS.vibrantEmerald} 0%, ${VIBRANT_COLORS.electricLime} 100%)`,
                }}
              />
              <motion.div
                className='font-black mb-2 text-white'
                style={{
                  fontSize: '32px',
                  fontFamily: VIBRANT_TYPOGRAPHY.fonts.display,
                  textShadow: '0 2px 10px rgba(0, 230, 118, 0.5)',
                }}
                whileHover={{ scale: 1.1 }}
                animate={{
                  scale: [1, 1.05, 1],
                  textShadow: [
                    '0 2px 10px rgba(0, 230, 118, 0.5)',
                    '0 2px 15px rgba(0, 230, 118, 0.8)',
                    '0 2px 10px rgba(0, 230, 118, 0.5)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {currentSession.statistics.acceptedCount}
              </motion.div>
              <div className='font-medium text-white/80'>Accepted</div>
            </motion.div>
          </div>

          {/* Recovery Settings - Command Center Style */}
          <motion.div
            className='rounded-2xl p-6 relative overflow-hidden'
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <motion.h3
              className='font-black mb-6 text-white flex items-center gap-3'
              style={{
                fontSize: '22px',
                fontFamily: VIBRANT_TYPOGRAPHY.fonts.display,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <svg
                className='w-6 h-6'
                style={{ color: VIBRANT_COLORS.electricTeal }}
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
              Recovery Settings
            </motion.h3>

            <div className='space-y-4'>
              <motion.div
                className='flex justify-between items-center p-4 rounded-xl'
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <span className='font-medium text-white/80'>
                  Minimum Required:
                </span>
                <span className='font-bold text-white flex items-center gap-2'>
                  {currentSession.minimumAcceptances} of {totalInvitations}
                </span>
              </motion.div>

              <motion.div
                className='flex justify-between items-center p-4 rounded-xl'
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <span className='font-medium text-white/80'>Can Proceed:</span>
                <motion.span
                  className='font-bold flex items-center gap-2'
                  style={{
                    color: currentSession.canProceed
                      ? VIBRANT_COLORS.electricLime
                      : VIBRANT_COLORS.vibrantScarlet,
                  }}
                  whileHover={{ scale: 1.05 }}
                  animate={
                    currentSession.canProceed
                      ? {
                          textShadow: [
                            '0 0 10px rgba(110, 255, 0, 0.5)',
                            '0 0 20px rgba(110, 255, 0, 0.8)',
                            '0 0 10px rgba(110, 255, 0, 0.5)',
                          ],
                        }
                      : {
                          textShadow: [
                            '0 0 10px rgba(255, 77, 77, 0.5)',
                            '0 0 20px rgba(255, 77, 77, 0.8)',
                            '0 0 10px rgba(255, 77, 77, 0.5)',
                          ],
                        }
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {currentSession.canProceed ? '✅ Yes' : '❌ No'}
                </motion.span>
              </motion.div>

              <motion.div
                className='flex justify-between items-center p-4 rounded-xl'
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                <span className='font-medium text-white/80'>Version:</span>
                <span className='font-bold text-white/90'>v1.0.0</span>
              </motion.div>

              <motion.div
                className='flex justify-between items-center p-4 rounded-xl'
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                <span className='font-medium text-white/80'>Last Check:</span>
                <span className='font-bold text-white/90'>
                  {new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </motion.div>
            </div>

            {/* View History Link */}
            <motion.div
              className='mt-6 pt-4 border-t border-white/20'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <button
                className='flex items-center gap-2 text-sm font-medium hover:underline transition-colors'
                style={{ color: VIBRANT_COLORS.electricTeal }}
                onClick={() => navigate('/session-monitoring')}
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
                View History
              </button>
            </motion.div>
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
        transition={{
          delay: 0.2,
          duration: 0.8,
          type: 'spring',
          stiffness: 100,
        }}
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
            ease: 'easeInOut',
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
          fontSize:
            window.innerWidth < 640
              ? VIBRANT_TYPOGRAPHY.sizes.display.mobile
              : VIBRANT_TYPOGRAPHY.sizes.display.size,
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
            <svg
              className='w-5 h-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={3}
                d='M13 7l5 5m0 0l-5 5m5-5H6'
              />
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

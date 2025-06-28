import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Phone, Wallet } from 'lucide-react';
import { guardianApi } from '../api/guardian';
import { recoveryApi } from '../api/recovery';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { SwipeableGuardianCard } from '../components/guardian/SwipeableGuardianCard';
import { GuardianDetailsModal } from '../components/guardian/GuardianDetailsModal';
import { GuardianSkeleton } from '../components/ui/Skeleton';
import { PullToRefresh } from '../components/ui/PullToRefresh';
import {
  VIBRANT_COLORS,
  VIBRANT_TYPOGRAPHY,
} from '../constants/vibrant-design-system';

interface GuardianData {
  id: string;
  name: string;
  type: 'EMAIL' | 'PHONE' | 'WALLET';
  contactInfo: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  healthScore?: number;
  lastActive?: string;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'EXPIRED';
}

interface SessionGuardian {
  invitationId: string;
  guardianName?: string;
  contactInfo: string;
  type: string;
  status: string;
  sentAt: string;
  expiresAt: string;
  respondedAt?: string;
}

// Helper function to get guardian type icon and colors
const getGuardianTypeConfig = (type: string) => {
  switch (type) {
    case 'EMAIL':
      return {
        icon: Mail,
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
        gradientFrom: 'from-blue-400',
        gradientTo: 'to-blue-600'
      };
    case 'PHONE':
      return {
        icon: Phone,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
        gradientFrom: 'from-green-400',
        gradientTo: 'to-green-600'
      };
    case 'WALLET':
      return {
        icon: Wallet,
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600',
        gradientFrom: 'from-purple-400',
        gradientTo: 'to-purple-600'
      };
    default:
      return {
        icon: Wallet,
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-600',
        gradientFrom: 'from-gray-400',
        gradientTo: 'to-gray-600'
      };
  }
};

export const GuardianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [selectedGuardian, setSelectedGuardian] = useState<GuardianData | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Query guardians from API
  const {
    data: guardiansData,
    refetch: refetchGuardians,
    isLoading,
  } = useQuery({
    queryKey: ['guardians'],
    queryFn: () => guardianApi.getGuardians(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Query current session to show session guardians if no permanent guardians
  const { data: currentSession } = useQuery({
    queryKey: ['currentSession'],
    queryFn: () => guardianApi.getCurrentSession(),
    retry: false,
  });

  // Query current version
  const { data: versionData } = useQuery({
    queryKey: ['currentVersion'],
    queryFn: () => guardianApi.getCurrentVersion(),
  });

  // Query active recovery sessions
  const { data: activeRecoveryData } = useQuery({
    queryKey: ['activeRecoverySessions'],
    queryFn: () => recoveryApi.getActiveRecoverySessions(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const guardians = guardiansData?.data || [];
  const currentVersion = versionData?.data || { version: 'v1.0.0' };
  const activeRecoverySessions = activeRecoveryData || [];

  // Get guardian count from session if no permanent guardians
  const sessionGuardians = currentSession?.invitations || [];
  const activeGuardianCount =
    guardians.length > 0
      ? guardians.filter((g: GuardianData) => g.status === 'ACTIVE').length
      : sessionGuardians.filter((g: SessionGuardian) => g.status === 'ACCEPTED')
          .length;
  const totalGuardianCount =
    guardians.length > 0 ? guardians.length : sessionGuardians.length;

  // Health check mutation
  const healthCheckMutation = useMutation({
    mutationFn: () => guardianApi.bulkHealthCheck(),
    onSuccess: () => {
      showSuccess('Health check completed');
      refetchGuardians();
    },
    onError: () => {
      showError('Health check failed');
    },
  });

  // Delete guardian mutation
  const deleteGuardianMutation = useMutation({
    mutationFn: (guardianId: string) => guardianApi.deleteGuardian(guardianId),
    onSuccess: () => {
      showSuccess('Guardian removed successfully');
      refetchGuardians();
    },
    onError: () => {
      showError('Failed to remove guardian');
    },
  });

  // const getHealthStatusColor = (score?: number) => {
  //   if (!score) return 'text-gray-500';
  //   if (score >= 80) return 'text-green-500';
  //   if (score >= 50) return 'text-yellow-500';
  //   return 'text-red-500';
  // };

  // const getHealthStatusIcon = (score?: number) => {
  //   if (!score) return '⏸️';
  //   if (score >= 80) return '✅';
  //   if (score >= 50) return '⚠️';
  //   return '❌';
  // };

  // const getStatusBadgeClass = (status: string) => {
  //   switch (status) {
  //     case 'ACTIVE':
  //       return 'bg-green-100 text-green-800';
  //     case 'PENDING':
  //       return 'bg-yellow-100 text-yellow-800';
  //     case 'INACTIVE':
  //       return 'bg-red-100 text-red-800';
  //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // };

  const handleHealthCheck = () => {
    healthCheckMutation.mutate();
  };

  const handleReplaceGuardian = (guardian: GuardianData) => {
    // Navigate to setup with replace mode
    navigate('/setup', { state: { replaceGuardian: guardian } });
  };

  const handleRemoveGuardian = (guardianId: string) => {
    if (confirm('Are you sure you want to remove this guardian?')) {
      deleteGuardianMutation.mutate(guardianId);
    }
  };

  const getRecoveryStateLabel = (state: string) => {
    switch (state) {
      case 'initiated':
      case 'notified':
        return 'Waiting for Guardians';
      case 'approving':
        return 'Collecting Shares';
      case 'approved':
        return 'Ready to Complete';
      case 'completing':
        return 'Completing Recovery';
      default:
        return state;
    }
  };

  const getRecoveryStateColor = (state: string) => {
    switch (state) {
      case 'initiated':
      case 'notified':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approving':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  return (
    <motion.div
      className='h-full flex flex-col relative overflow-hidden bg-gray-50'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >

      {/* Header */}
      <motion.div
        className='px-4 sm:px-6 py-4 border-b border-gray-200 bg-white relative z-10'
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className='flex items-center justify-between'>
          <div>
            <motion.h1
              className='font-black text-gray-900 text-2xl mb-1'
              style={{
                fontFamily: VIBRANT_TYPOGRAPHY.fonts.display,
              }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Social Recovery
            </motion.h1>
            <p className='text-gray-600 text-sm font-medium'>Guardian Dashboard</p>
          </div>
          <div className='flex items-center space-x-3'>
            {/* User email */}
            <span className='text-gray-500 text-sm hidden sm:block'>testuser@example.com</span>
            
            <motion.button
              onClick={() => navigate('/dashboard')}
              className='w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 bg-gray-100 hover:bg-gray-200'
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <svg
                className='w-5 h-5 text-gray-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <PullToRefresh
        onRefresh={async () => {
          await refetchGuardians();
          showSuccess('Refreshed guardian list');
        }}
      >
        <div className='flex-1'>
          {/* Active Recovery Sessions - Most Prominent */}
          {activeRecoverySessions.length > 0 && (
            <div className='px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-100'>
              <div className='mb-3'>
                <h2 className='text-lg font-semibold text-gray-900 flex items-center'>
                  <span className='text-2xl mr-2'>🚨</span>
                  Active Recovery in Progress
                </h2>
              </div>
              {activeRecoverySessions.map((session, index) => (
                <motion.div
                  key={session.sessionId}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='mb-3'
                >
                  <Card
                    className={`border-2 ${getRecoveryStateColor(
                      session.state
                    )} cursor-pointer hover:shadow-lg transition-shadow`}
                    onClick={() =>
                      navigate(`/recovery/progress/${session.sessionId}`)
                    }
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div>
                        <h3 className='font-semibold text-gray-900 mb-1'>
                          {getRecoveryStateLabel(session.state)}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          Session ID: {session.sessionId.slice(0, 12)}...
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium'>
                          {getTimeRemaining(session.expiresAt)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className='mb-3'>
                      <div className='flex items-center justify-between text-sm mb-1'>
                        <span className='text-gray-600'>
                          Guardian Approvals
                        </span>
                        <span className='font-medium'>
                          {session.receivedShares || 0} /{' '}
                          {session.requiredShares || 2}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                          style={{
                            width: `${Math.min(
                              100,
                              ((session.receivedShares || 0) /
                                (session.requiredShares || 2)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Guardian Status */}
                    {session.approvalsDetailed &&
                      session.approvalsDetailed.guardians.length > 0 && (
                        <div className='space-y-1'>
                          {session.approvalsDetailed.guardians.map(
                            (guardian) => (
                              <div
                                key={guardian.guardianId}
                                className='flex items-center justify-between text-sm'
                              >
                                <div className='flex items-center'>
                                  <span
                                    className={`w-2 h-2 rounded-full mr-2 ${
                                      guardian.hasSubmitted
                                        ? 'bg-green-500'
                                        : 'bg-gray-300'
                                    }`}
                                  />
                                  <span className='text-gray-700'>
                                    {guardian.type} Guardian
                                  </span>
                                </div>
                                <span
                                  className={
                                    guardian.hasSubmitted
                                      ? 'text-green-600'
                                      : 'text-gray-400'
                                  }
                                >
                                  {guardian.hasSubmitted
                                    ? 'Approved'
                                    : 'Pending'}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {/* Action Button */}
                    <div className='mt-4 flex items-center justify-between'>
                      <Button
                        size='sm'
                        variant='primary'
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/recovery/progress/${session.sessionId}`);
                        }}
                        className='flex-1 mr-2'
                      >
                        View Recovery Progress →
                      </Button>
                      {session.state === 'approved' && (
                        <Button
                          size='sm'
                          variant='secondary'
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/recovery/complete/${session.sessionId}`);
                          }}
                          className='bg-green-600 hover:bg-green-700 text-white'
                        >
                          Complete Recovery
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Hero Status Card */}
          <div className='px-4 sm:px-6 py-6 relative z-10'>
            <motion.div
              className='rounded-3xl p-8 relative overflow-hidden'
              style={{
                background:
                  activeGuardianCount > 0
                    ? `linear-gradient(135deg, ${VIBRANT_COLORS.vibrantEmerald} 0%, ${VIBRANT_COLORS.electricLime} 100%)`
                    : `linear-gradient(135deg, ${VIBRANT_COLORS.electricBlue} 0%, ${VIBRANT_COLORS.neonPurple} 100%)`,
                boxShadow:
                  activeGuardianCount > 0
                    ? `0 5px 60px rgba(0, 230, 118, 0.4), 0 5px 15px rgba(110, 255, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)`
                    : `0 5px 60px rgba(0, 163, 255, 0.4), 0 5px 13px rgba(163, 0, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)`,
              }}
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Animated shield/lock icon */}
              <motion.div
                className='absolute top-6 right-6 w-16 h-16 rounded-2xl flex items-center justify-center'
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {activeGuardianCount > 0 ? (
                  <svg
                    className='w-9 h-9'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <motion.path
                      d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                      stroke='white'
                      strokeWidth={2.5}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ 
                        pathLength: 1, 
                        opacity: 1,
                        filter: [
                          'drop-shadow(0 0 8px rgba(255,255,255,0.5))',
                          'drop-shadow(0 0 12px rgba(255,255,255,0.8))',
                          'drop-shadow(0 0 8px rgba(255,255,255,0.5))'
                        ]
                      }}
                      transition={{
                        pathLength: { duration: 2, ease: "easeInOut" },
                        opacity: { duration: 0.5 },
                        filter: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-9 h-9'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <motion.path
                      d='M12 2.944a11.955 11.955 0 00-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016A11.955 11.955 0 0012 2.944z'
                      stroke='white'
                      strokeWidth={2}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeDasharray="4 4"
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: 1,
                        strokeDashoffset: [0, -8],
                      }}
                      transition={{
                        pathLength: { duration: 2, ease: "easeInOut" },
                        strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
                      }}
                      style={{
                        filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))'
                      }}
                    />
                  </svg>
                )}
              </motion.div>

              <div className='mb-6 pr-20'>
                <motion.h2
                  className='font-black text-white mb-2'
                  style={{
                    fontSize: '32px',
                    fontFamily: VIBRANT_TYPOGRAPHY.fonts.display,
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                  }}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {activeGuardianCount > 0
                    ? 'Wallet Protected'
                    : 'Setup in Progress'}
                </motion.h2>

                <motion.div
                  className='flex items-center gap-3'
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.span
                    className='px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 text-white'
                    style={{
                      background: activeGuardianCount > 0
                        ? VIBRANT_COLORS.vibrantEmerald
                        : VIBRANT_COLORS.radiantOrange,
                      boxShadow: activeGuardianCount > 0
                        ? `0 4px 20px rgba(0, 230, 118, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)`
                        : `0 4px 20px rgba(255, 127, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)`,
                    }}
                    animate={
                      activeGuardianCount > 0
                        ? {
                            boxShadow: [
                              '0 4px 20px rgba(0, 230, 118, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                              '0 4px 30px rgba(0, 230, 118, 0.8), inset 0 1px 0 rgba(255,255,255,0.5)',
                              '0 4px 20px rgba(0, 230, 118, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                            ],
                          }
                        : {
                            scale: [1, 1.05, 1],
                            boxShadow: [
                              '0 4px 20px rgba(255, 127, 0, 0.5)',
                              '0 4px 30px rgba(255, 127, 0, 0.8)',
                              '0 4px 20px rgba(255, 127, 0, 0.5)',
                            ],
                          }
                    }
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {activeGuardianCount > 0 ? (
                      <>✨ ACTIVE</>
                    ) : (
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
                  </motion.span>
                </motion.div>
              </div>

              <motion.p
                className='font-medium mb-6'
                style={{
                  fontSize: '16px',
                  color: VIBRANT_COLORS.softWhite,
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {activeGuardianCount > 0 ? (
                  <span className='flex items-center gap-2'>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      🛡️
                    </motion.span>
                    {activeGuardianCount} Active Guardians • Your wallet is
                    fully secured
                  </span>
                ) : (
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
                    Complete your guardian setup to secure your wallet
                  </span>
                )}
              </motion.p>

              {/* Last Check Info - only for protected wallet */}
              {activeGuardianCount > 0 && (
                <motion.div
                  className='flex items-center justify-between text-sm'
                  style={{ color: VIBRANT_COLORS.softWhite }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 0.9 }}
                >
                  <span>
                    Last Check:{' '}
                    {new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>v1.0.0</span>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className='px-4 sm:px-6 pb-4'>
            <div className='grid grid-cols-2 gap-4'>
              <motion.button
                onClick={() => navigate('/setup')}
                className='h-20 rounded-2xl flex flex-col items-center justify-center gap-2 text-white font-semibold relative overflow-hidden'
                style={{
                  background: `linear-gradient(135deg, ${VIBRANT_COLORS.vibrantCerulean} 0%, ${VIBRANT_COLORS.electricIndigo} 100%)`,
                  boxShadow: '0 8px 25px rgba(0, 123, 255, 0.3)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <motion.div
                  className='text-2xl'
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  ✨
                </motion.div>
                <span>Add Guardian</span>
              </motion.button>
              
              <motion.button
                onClick={handleHealthCheck}
                disabled={healthCheckMutation.isPending}
                className='h-20 rounded-2xl flex flex-col items-center justify-center gap-2 font-semibold relative overflow-hidden border-2 bg-white'
                style={{
                  borderColor: VIBRANT_COLORS.electricTeal,
                  color: VIBRANT_COLORS.electricTeal,
                }}
                whileHover={{ 
                  scale: 1.05,
                  background: `rgba(0, 206, 209, 0.1)`,
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.div
                  className='text-2xl'
                  animate={healthCheckMutation.isPending ? {
                    rotate: 360
                  } : {}}
                  transition={{
                    duration: 1,
                    repeat: healthCheckMutation.isPending ? Infinity : 0,
                    ease: "linear"
                  }}
                >
                  🔍
                </motion.div>
                <span>{healthCheckMutation.isPending ? 'Checking...' : 'Health Check'}</span>
              </motion.button>
            </div>
          </div>

          {/* Guardian List */}
          <div className='px-4 sm:px-6 pb-3 sm:pb-4'>
            <h3 className='font-semibold mb-3 text-lg text-gray-900'>
              Active Guardians
            </h3>

            {isLoading ? (
              <GuardianSkeleton />
            ) : totalGuardianCount === 0 ? (
              <EmptyState
                icon='👥'
                title='No Guardians Yet'
                description='Add guardians to secure your wallet'
                action={{
                  label: 'Add First Guardian',
                  onClick: () => navigate('/setup'),
                }}
              />
            ) : guardians.length > 0 ? (
              // Show permanent guardians
              <div className='space-y-3'>
                {guardians.map((guardian: GuardianData, index: number) => (
                  <motion.div
                    key={guardian.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SwipeableGuardianCard
                      {...guardian}
                      onReplace={() => handleReplaceGuardian(guardian)}
                      onRemove={() => handleRemoveGuardian(guardian.id)}
                      onVerify={() => {
                        showSuccess('Verification started');
                      }}
                      onClick={() => {
                        setSelectedGuardian(guardian);
                        setShowDetailsModal(true);
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              // Show session guardians if no permanent guardians
              <div className='space-y-3'>
                {sessionGuardians.map((guardian, index) => (
                  <motion.div
                    key={`session-${guardian.invitationId}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                          {React.createElement(getGuardianTypeConfig(guardian.type).icon, {
                            className: "w-5 h-5 text-gray-600"
                          })}
                        </div>
                        <div className='flex-1'>
                          <p className='font-medium text-gray-900'>
                            {guardian.guardianName || 'Guardian'}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {guardian.contactInfo}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            guardian.status === 'ACCEPTED'
                              ? 'bg-green-100 text-green-800'
                              : guardian.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {guardian.status === 'ACCEPTED'
                            ? 'Accepted'
                            : guardian.status === 'PENDING'
                            ? 'Pending'
                            : guardian.status}
                        </span>
                      </div>
                    </div>
                    {guardian.status === 'ACCEPTED' && (
                      <motion.div 
                        className='mt-3 rounded-lg p-3 flex items-center gap-2'
                        style={{
                          backgroundColor: VIBRANT_COLORS.success.light,
                          border: `1px solid ${VIBRANT_COLORS.success.main}`,
                        }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 20, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        >
                          ✅
                        </motion.div>
                        <p className='text-sm font-medium' style={{ color: VIBRANT_COLORS.success.dark }}>
                          Ready to secure your wallet! Complete setup to activate.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}

                {/* Complete Setup Call-to-Action */}
                {currentSession?.status === 'ALL_ACCEPTED' && (
                  <div className='bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4'>
                    <div className='flex items-center space-x-2 mb-3'>
                      <span className='text-xl'>🎉</span>
                      <p className='font-medium text-blue-900'>
                        All guardians accepted!
                      </p>
                    </div>
                    <p className='text-sm text-blue-700 mb-3'>
                      Complete your setup to convert these to permanent
                      guardians and secure your wallet.
                    </p>
                    <Button
                      onClick={() => navigate('/session-monitoring')}
                      size='sm'
                      className='bg-blue-600 hover:bg-blue-700'
                    >
                      Complete Setup Now →
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recovery Section */}
          <div className='px-4 sm:px-6 pb-6 sm:pb-8'>
            {/* Recovery CTA */}
            <motion.div 
              className='bg-white rounded-2xl p-6 mb-4 shadow-lg'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='font-semibold text-lg mb-1' style={{ color: VIBRANT_COLORS.darkCarbon }}>
                    Need to recover yours wallet?
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Start the recovery process with your guardians
                  </p>
                </div>
                <motion.button
                  onClick={() => navigate('/recovery/start')}
                  className='px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2'
                  style={{
                    background: `linear-gradient(135deg, ${VIBRANT_COLORS.radiantOrange} 0%, ${VIBRANT_COLORS.sunsetRed} 100%)`,
                    boxShadow: '0 8px 25px rgba(255, 127, 0, 0.3)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.svg
                    className='w-5 h-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                    />
                  </motion.svg>
                  Start Recovery
                </motion.button>
              </div>
            </motion.div>

            {/* Recovery Settings */}
            <motion.div 
              className='bg-white rounded-2xl p-6 shadow-lg'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <h3 className='font-semibold text-lg mb-4' style={{ color: VIBRANT_COLORS.darkCarbon }}>
                Recovery Settings
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span style={{ color: VIBRANT_COLORS.darkCarbon }}>Minimum Required</span>
                  <span className='font-bold text-lg'>2 of {totalGuardianCount}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span style={{ color: VIBRANT_COLORS.darkCarbon }}>Version</span>
                  <span className='font-semibold'>
                    {currentVersion?.version || 'v1.0.0'}
                  </span>
                </div>
              </div>
              <div className='mt-6 pt-4 border-t border-gray-200'>
                <motion.button
                  onClick={() => navigate('/sessions')}
                  className='flex items-center gap-2 text-sm font-medium'
                  style={{ color: VIBRANT_COLORS.electricBlue }}
                  whileHover={{ scale: 1.05 }}
                >
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} 
                      d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                  </svg>
                  View History
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </PullToRefresh>

      {/* Guardian Details Modal */}
      <GuardianDetailsModal
        guardian={selectedGuardian}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onVerify={() => {
          showSuccess('Verification process started');
          setShowDetailsModal(false);
        }}
        onSendTest={() => {
          showSuccess('Test message sent to guardian');
        }}
        onRemove={() => {
          if (selectedGuardian) {
            handleRemoveGuardian(selectedGuardian.id);
            setShowDetailsModal(false);
          }
        }}
      />
    </motion.div>
  );
};

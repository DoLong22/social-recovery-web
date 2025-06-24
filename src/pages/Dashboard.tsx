import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { guardianApi } from '../api/guardian';
import { AnimatedShield } from '../components/ui/AnimatedShield';
import { ModernButton } from '../components/ui/ModernButton';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GRADIENTS, MODERN_COLORS, MODERN_TYPOGRAPHY } from '../constants/modern-design-system';
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
      <div className="h-full flex items-center justify-center px-6">
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

  // Show session status if active (but not completed)
  if (currentSession && currentSession.status !== 'COMPLETED') {
    return (
      <div className="space-y-6">
        {/* Current Session Status */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Active Session</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentSession.status === 'ALL_ACCEPTED' ? 'bg-green-100 text-green-800' :
              currentSession.status === 'WAITING_FOR_ALL' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentSession.status.replace(/_/g, ' ')}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4">
            You have an active guardian setup session. 
            {currentSession.status === 'ALL_ACCEPTED' && ' All guardians have accepted!'}
            {currentSession.status === 'WAITING_FOR_ALL' && ' Waiting for guardian responses...'}
            {currentSession.status === 'SOME_DECLINED' && ' Some guardians have declined.'}
          </p>

          <div className="space-y-3">
            {currentSession.status === 'ALL_ACCEPTED' ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800 mb-2">
                    <span className="text-xl">🎉</span>
                    <p className="font-medium">Ready to complete setup!</p>
                  </div>
                  <p className="text-sm text-green-700">
                    All guardians have accepted. Complete your setup to secure your wallet.
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/session-monitoring')}
                  fullWidth
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Complete Setup Now →
                </Button>
              </>
            ) : currentSession.status === 'WAITING_FOR_ALL' || currentSession.status === 'SOME_DECLINED' ? (
              <Button onClick={() => navigate('/session-monitoring')} fullWidth>
                View Session Status
              </Button>
            ) : (
              <Button onClick={() => navigate('/guardian-dashboard')} fullWidth>
                View Guardian Dashboard
              </Button>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentSession.statistics.totalInvitations}</div>
              <div className="text-sm text-gray-600">Total Guardians</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentSession.statistics.acceptedCount}
              </div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
          </Card>
        </div>

        {/* Session Details */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Minimum Required:</span>
              <span className="font-medium">{currentSession.minimumAcceptances} guardians</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Can Proceed:</span>
              <span className={`font-medium ${currentSession.canProceed ? 'text-green-600' : 'text-red-600'}`}>
                {currentSession.canProceed ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">
                {new Date(currentSession.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Recovery Option */}
        <Card className="bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Need to recover your wallet?</h3>
              <p className="text-sm text-gray-600 mt-1">Start the recovery process with your guardians</p>
            </div>
            <Button 
              onClick={() => navigate('/recovery/start')}
              variant="outline"
              size="sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
              </svg>
              Recover
            </Button>
          </div>
        </Card>
      </div>
    );
  }


  // Show empty state if no guardians (matching welcome screen design)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='flex flex-col items-center justify-center h-full text-center px-6'
      style={{
        background: GRADIENTS.radialBackgroundBlue,
      }}
    >
      {/* Animated Shield */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className='mb-8'
      >
        <AnimatedShield size={140} />
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className='mb-4'
        style={{
          fontSize: MODERN_TYPOGRAPHY.sizes['3xl'].size,
          lineHeight: MODERN_TYPOGRAPHY.sizes['3xl'].lineHeight,
          fontWeight: MODERN_TYPOGRAPHY.weights.black,
          color: MODERN_COLORS.neutral[900],
        }}
      >
        Secure Your Wallet with Guardians
      </motion.h1>

      {/* Sub-headline */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className='mb-10 max-w-sm'
        style={{
          fontSize: MODERN_TYPOGRAPHY.sizes.lg.size,
          fontWeight: MODERN_TYPOGRAPHY.weights.medium,
          color: MODERN_COLORS.neutral[700],
        }}
      >
        Replace complex seed phrases with trusted friends & family
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className='w-full max-w-xs'
      >
        <ModernButton
          onClick={() => navigate('/setup')}
          size='lg'
          fullWidth
          variant='primary'
          icon={
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
            </svg>
          }
        >
          Start Guardian Setup
        </ModernButton>
      </motion.div>

      {/* User email - subtle placement */}
      {email && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className='mt-8 text-sm'
          style={{
            color: MODERN_COLORS.neutral[500],
          }}
        >
          {email}
        </motion.p>
      )}
    </motion.div>
  );
};
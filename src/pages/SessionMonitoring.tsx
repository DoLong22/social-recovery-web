import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { guardianApi } from '../api/guardian';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useEnhancedSuccessAnimation } from '../components/ui/EnhancedSuccessAnimation';
import { getStatusIcon, getStatusColor, getTimeSinceDate, formatGuardianDisplay } from '../utils/guardianHelpers';
import { GuardianSetupFlow } from '../utils/guardianSetupFlow';
import { FrontendSaltService } from '../utils/saltDerivation';

// Pull-to-refresh hook
const usePullToRefresh = (onRefresh: () => void) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const handleTouchStart = useCallback(() => {
    if (window.scrollY === 0) {
      setIsPulling(true);
    }
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isPulling) {
      const distance = e.touches[0].clientY;
      setPullDistance(Math.min(distance, 100));
    }
  }, [isPulling]);
  
  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 50) {
      onRefresh();
    }
    setIsPulling(false);
    setPullDistance(0);
  }, [pullDistance, onRefresh]);
  
  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    pullDistance,
    isPulling
  };
};

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

  const pullToRefresh = usePullToRefresh(handleRefresh);

  // State for master password input
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
  }, [masterPassword, handleCompleteSetup]);

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
      className="h-full flex flex-col bg-gray-50"
      onTouchStart={pullToRefresh.handleTouchStart}
      onTouchMove={pullToRefresh.handleTouchMove}
      onTouchEnd={pullToRefresh.handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {pullToRefresh.isPulling && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 flex justify-center pt-4 z-10"
          >
            <div className="bg-white rounded-full shadow-lg px-4 py-2">
              <span className="text-sm text-gray-600">Pull to refresh</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Simplified */}
      <div className="px-4 sm:px-6 pt-safe-top pb-3 sm:pb-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Waiting for Guardians
          </h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Progress Section - Redesigned */}
        <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 mb-2">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stillWaitingFor > 0 ? (
                <>Waiting for {stillWaitingFor} {stillWaitingFor === 1 ? 'response' : 'responses'}</>
              ) : (
                <>All guardians responded! 🎉</>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {totalResponded} of {totalInvitations} responded • {acceptedCount} accepted
            </div>
          </div>

          {/* Response Progress */}
          <div className="flex justify-center gap-2 mb-4">
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
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    status === 'accepted' ? 'bg-green-500 text-white' :
                    status === 'declined' ? 'bg-red-500 text-white' :
                    'bg-gray-200 text-gray-400'
                  }`}
                >
                  {status === 'accepted' ? '✓' : status === 'declined' ? '✗' : '?'}
                </motion.div>
              );
            })}
          </div>

          {/* Threshold Information */}
          {currentSession.canProceed && (
            <div className="bg-green-50 rounded-xl p-3 text-center mb-3">
              <p className="text-sm text-green-800">
                ✅ Recovery threshold met! ({acceptedCount} of {minimumNeeded} needed)
              </p>
            </div>
          )}
          {!currentSession.canProceed && acceptedCount < minimumNeeded && (
            <div className="bg-yellow-50 rounded-xl p-3 text-center mb-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Need at least {minimumNeeded} acceptances for recovery ({acceptedCount} so far)
              </p>
            </div>
          )}

          {/* Expected Timeline */}
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-sm text-blue-800">
              💡 Most guardians respond within 2-4 hours
            </p>
          </div>
        </div>

        {/* Guardian List - Moved to top and redesigned */}
        <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 mb-2">
          <h3 className="font-medium text-gray-900 mb-3">Guardian Status</h3>
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
                  <Card className="border-gray-100" padding="sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`text-2xl ${getStatusColor(invitation.status)}`}>
                          {getStatusIcon(invitation.status)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
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
                        <span className="text-xs text-gray-400">Waiting...</span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* What Happens Next Section */}
        <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 mb-2">
          <h3 className="font-medium text-gray-900 mb-3">What happens next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium">Guardians receive invitation</p>
                <p className="text-xs text-gray-600 mt-0.5">They'll get an email or SMS with instructions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium">They accept or decline</p>
                <p className="text-xs text-gray-600 mt-0.5">Most respond within 2-4 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium">Setup completes when all respond</p>
                <p className="text-xs text-gray-600 mt-0.5">Need at least {minimumNeeded} acceptances for recovery</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Tip:</strong> You can contact your guardians directly to remind them about the invitation
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3">
          {/* Refresh Button with Last Updated */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">
              Last updated: {formatLastRefresh()}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefresh}
              loading={isRefetching}
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>

          {/* Proceed Button when ready */}
          {stillWaitingFor === 0 && currentSession.canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-green-50 border-green-200">
                <div className="flex items-center space-x-2 text-green-800 mb-3">
                  <span className="text-xl">🎉</span>
                  <p className="font-medium">All guardians responded! Ready to complete setup!</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-blue-800">
                    🔐 <strong>Security:</strong> Your recovery secret will be encrypted with zero-knowledge architecture using your master password
                  </p>
                </div>
                <Button 
                  onClick={handleCompleteSetup}
                  loading={distributeMutation.isPending}
                  fullWidth
                  className="bg-green-600 hover:bg-green-700"
                >
                  {distributeMutation.isPending ? 'Generating Encrypted Shares...' : 'Complete Setup →'}
                </Button>
                {distributeMutation.isPending && (
                  <p className="text-xs text-green-700 mt-2 text-center">
                    Creating encrypted shares with dual-salt security...
                  </p>
                )}
              </Card>
            </motion.div>
          )}

          {/* Not enough acceptances warning */}
          {stillWaitingFor === 0 && !currentSession.canProceed && (
            <Card className="bg-red-50 border-red-200">
              <p className="text-red-800 font-medium mb-3">
                ❌ Not enough acceptances
              </p>
              <p className="text-sm text-red-700 mb-3">
                You received {acceptedCount} acceptance{acceptedCount !== 1 ? 's' : ''} but need at least {minimumNeeded} for recovery. 
                Please invite more guardians.
              </p>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/improved-guardian-setup')}
                fullWidth
              >
                Invite More Guardians
              </Button>
            </Card>
          )}

          {/* Decline handling */}
          {currentSession.status === 'SOME_DECLINED' && currentSession.statistics.declinedCount > 0 && (
            <Card className="bg-red-50 border-red-200">
              <p className="text-red-800 font-medium mb-3">
                ⚠️ {currentSession.statistics.declinedCount} guardian{currentSession.statistics.declinedCount > 1 ? 's' : ''} declined
              </p>
              <p className="text-sm text-red-700 mb-3">
                You may need to invite additional guardians to meet your threshold.
              </p>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/improved-guardian-setup')}
                fullWidth
              >
                Add More Guardians
              </Button>
            </Card>
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
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Enter Master Password
                </h3>
                <p className="text-sm text-gray-600">
                  Your master password is needed to encrypt recovery shares with zero-knowledge security.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Master Password
                  </label>
                  <input
                    type="password"
                    value={masterPassword}
                    onChange={(e) => {
                      setMasterPassword(e.target.value);
                      setPasswordError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordSubmit();
                      }
                    }}
                    placeholder="Enter your secure master password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-red-600 text-xs mt-1">{passwordError}</p>
                  )}
                </div>

                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Requirements:</strong> 12+ characters with uppercase, lowercase, numbers, and special characters
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowPasswordPrompt(false);
                      setMasterPassword('');
                      setPasswordError('');
                    }}
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePasswordSubmit}
                    fullWidth
                    disabled={!masterPassword.trim()}
                  >
                    Continue
                  </Button>
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
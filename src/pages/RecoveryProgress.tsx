import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { recoveryApi } from '../api/recovery';
import type { CollectedShare } from '../api/recovery';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { RecoveryModal } from '../components/recovery/RecoveryModal';

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
  const getIcon = () => {
    if (guardian.hasSubmitted) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: index * 0.1 }}
          className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      );
    }
    
    return (
      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full"
        />
      </div>
    );
  };

  const getTypeIcon = () => {
    switch (guardian.type) {
      case 'EMAIL':
        return '📧';
      case 'PHONE':
        return '📱';
      case 'WALLET':
        return '💰';
      default:
        return '👤';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-center justify-between p-4 rounded-xl border ${
        guardian.hasSubmitted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center space-x-3">
        {getIcon()}
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getTypeIcon()}</span>
            <p className="font-medium text-gray-900">{guardian.name}</p>
          </div>
          {guardian.hasSubmitted && guardian.submittedAt && (
            <p className="text-xs text-gray-500">
              Submitted {new Date(guardian.submittedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
      
      <div className="text-sm font-medium">
        {guardian.hasSubmitted ? (
          <span className="text-green-600">Submitted ✓</span>
        ) : (
          <span className="text-gray-400">Waiting...</span>
        )}
      </div>
    </motion.div>
  );
};

export const RecoveryProgress: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [collectedShares, setCollectedShares] = useState<CollectedShare[] | null>(null);

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

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-blue-100 rounded-full"></div>
        </div>
      </div>
    );
  }

  const progress = (session.approvalsDetailed.received / session.approvalsDetailed.required) * 100;
  const remainingGuardians = session.approvalsDetailed.required - session.approvalsDetailed.received;

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
    <div className="h-full bg-gradient-to-b from-gray-50 to-white p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recovery in Progress</h1>
          <p className="text-gray-600">Waiting for guardian responses</p>
        </div>

        {/* Progress Card */}
        <Card className="mb-6">
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-medium text-gray-700">Guardian Responses</span>
              <span className="text-sm text-gray-500">
                {session.approvalsDetailed.received} of {session.approvalsDetailed.required}
              </span>
            </div>
            <ProgressBar value={progress} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {session.approvalsDetailed.received}
              </p>
              <p className="text-xs text-gray-500">Submitted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">
                {remainingGuardians}
              </p>
              <p className="text-xs text-gray-500">Remaining</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {session.approvalsDetailed.required}
              </p>
              <p className="text-xs text-gray-500">Required</p>
            </div>
          </div>

          {remainingGuardians > 0 ? (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Need {remainingGuardians} more guardian{remainingGuardians > 1 ? 's' : ''} to proceed
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xl">🎉</span>
                <p className="font-medium text-green-900">Threshold reached!</p>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Enough guardians have submitted their shares. You can now continue to authenticate and recover your wallet.
              </p>
              <Button
                onClick={handleStartRecovery}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Start Recovery Process →
              </Button>
            </div>
          )}
        </Card>

        {/* Guardian List */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Guardian Status</h3>
          <div className="space-y-3">
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
        </div>

        {/* Session Info */}
        <Card className="mb-6 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-2">Session Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Session ID:</span>
              <span className="text-gray-900 font-mono text-xs">
                {session.sessionId.slice(-8)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Started:</span>
              <span className="text-gray-900">
                {new Date(session.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expires:</span>
              <span className="text-gray-900">
                {new Date(session.expiresAt).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={async () => {
              try {
                const result = await refetch();
                console.log('Manual refresh result:', result.data);
                if (result.data) {
                  console.log('Guardian details:', result.data.approvalsDetailed.guardians);
                }
              } catch (error) {
                console.error('Refresh error:', error);
              }
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Status
          </Button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to cancel this recovery?')) {
                recoveryApi.cancelRecovery(sessionId!);
                navigate('/dashboard');
              }
            }}
            className="w-full text-center text-red-600 hover:text-red-700 font-medium py-3"
          >
            Cancel Recovery
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Guardians have received email notifications with instructions
          </p>
        </div>
      </motion.div>

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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { recoveryApi, getDeviceInfo } from '../api/recovery';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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
    <div className="h-full bg-gradient-to-b from-gray-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recover Your Wallet</h1>
          <p className="text-gray-600">Request help from your guardians to regain access</p>
        </div>

        {/* Warning Card */}
        <Card className="mb-6 bg-amber-50 border-amber-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" 
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800">Before You Continue</h3>
              <ul className="mt-1 text-xs text-amber-700 space-y-1">
                <li>• This will notify all your guardians via email</li>
                <li>• You'll need your master password to complete recovery</li>
                <li>• Recovery expires after 24 hours</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Device Information */}
        <Card className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Recovery will be initiated from:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Device:</span>
              <span className="text-gray-900 font-medium">
                {navigator.userAgent.includes('Mobile') ? '📱 Mobile' : '💻 Desktop'} Browser
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform:</span>
              <span className="text-gray-900 font-medium">Web</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Browser:</span>
              <span className="text-gray-900 font-medium">
                {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                 navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                 navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}
              </span>
            </div>
          </div>
        </Card>

        {/* Reason Input (Optional) */}
        <div className="mb-6">
          <button
            onClick={() => setShowReasonInput(!showReasonInput)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            {showReasonInput ? 'Hide' : 'Add'} recovery reason (optional)
            <svg 
              className={`w-4 h-4 ml-1 transform transition-transform ${showReasonInput ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showReasonInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Lost access to phone, Forgot password, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleInitiateRecovery}
            loading={initiateRecoveryMutation.isPending}
            fullWidth
            size="lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Recovery Process
          </Button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full text-center text-gray-600 hover:text-gray-800 font-medium py-3"
          >
            Cancel
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Need help? Check our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              recovery guide
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
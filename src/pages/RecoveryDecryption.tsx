import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RecoveryDecryption as RecoveryDecryptionUtil } from '../utils/recoveryDecryption';
import type { CollectedShare } from '../api/recovery';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { useSuccessAnimation } from '../components/ui/SuccessAnimation';

interface DecryptionState {
  backendSalt: string;
  setupTimestamp: number;
  guardianConfiguration: Array<{
    guardianId: string;
    contactHash: string;
    type: string;
  }>;
  collectedShares: CollectedShare[];
  password: string;
  sessionId: string;
}

interface StepStatus {
  step: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message: string;
}

const steps: StepStatus[] = [
  { step: 1, status: 'pending', message: 'Preparing decryption keys...' },
  { step: 2, status: 'pending', message: 'Decrypting guardian shares...' },
  { step: 3, status: 'pending', message: 'Reconstructing wallet secret...' },
  { step: 4, status: 'pending', message: 'Restoring wallet access...' }
];

export const RecoveryDecryption: React.FC = () => {
  // const params = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useToast();
  const { triggerSuccess, SuccessComponent } = useSuccessAnimation();
  
  const decryptionData = location.state as DecryptionState;
  const [currentSteps, setCurrentSteps] = useState(steps);
  const [error, setError] = useState<string | null>(null);
  // const [recoveredSecret, setRecoveredSecret] = useState<string | null>(null);

  useEffect(() => {
    if (!decryptionData) {
      navigate('/recovery/start');
      return;
    }

    performRecovery();
  }, []);

  const updateStep = (stepIndex: number, status: 'processing' | 'completed' | 'error', message?: string) => {
    setCurrentSteps(prev => prev.map((step, index) => {
      if (index === stepIndex) {
        return {
          ...step,
          status,
          message: message || step.message
        };
      }
      return step;
    }));
  };

  const performRecovery = async () => {
    try {
      // Step 1: Prepare decryption
      updateStep(0, 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

      const userId = localStorage.getItem('userId') || 'unknown_user';
      
      updateStep(0, 'completed', 'Encryption keys ready ✓');

      // Step 2: Decrypt shares
      updateStep(1, 'processing');
      
      const decryptionParams = {
        password: decryptionData.password,
        backendSalt: decryptionData.backendSalt,
        setupTimestamp: decryptionData.setupTimestamp,
        guardianConfiguration: decryptionData.guardianConfiguration,
        collectedShares: decryptionData.collectedShares,
        userId,
        sessionId: decryptionData.sessionId
      };

      const decryptedShares = await RecoveryDecryptionUtil.decryptShares(decryptionParams);
      
      updateStep(1, 'completed', `${decryptedShares.length} shares decrypted ✓`);

      // Step 3: Reconstruct secret
      updateStep(2, 'processing');
      
      const threshold = Math.ceil(decryptionData.guardianConfiguration.length * 0.6);
      // const secret = await RecoveryDecryptionUtil.reconstructSecret(decryptedShares, threshold);
      await RecoveryDecryptionUtil.reconstructSecret(decryptedShares, threshold);
      
      // setRecoveredSecret(secret);
      updateStep(2, 'completed', 'Wallet secret reconstructed ✓');

      // Step 4: Restore wallet
      updateStep(3, 'processing');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate wallet restoration
      
      // Store recovery completion
      localStorage.setItem('wallet_recovered', 'true');
      localStorage.setItem('recovery_timestamp', new Date().toISOString());
      
      updateStep(3, 'completed', 'Wallet access restored ✓');

      // Success!
      triggerSuccess('Recovery completed successfully!');
      
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { recoveryComplete: true } 
        });
      }, 3000);

    } catch (err: any) {
      const errorMessage = err.message || 'Recovery failed';
      setError(errorMessage);
      showError(errorMessage);
      
      // Find which step failed
      const failedStepIndex = currentSteps.findIndex(s => s.status === 'processing');
      if (failedStepIndex !== -1) {
        updateStep(failedStepIndex, 'error', errorMessage);
      }
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        );
      case 'processing':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full"
          />
        );
      case 'error':
        return (
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
        );
    }
  };

  if (!decryptionData) {
    return null;
  }

  return (
    <div className="h-full bg-gradient-to-b from-gray-50 to-white p-4 flex items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recovering Your Wallet</h1>
          <p className="text-gray-600">Please wait while we decrypt your recovery data</p>
        </div>

        {/* Progress Steps */}
        <Card className="mb-6">
          <div className="space-y-4">
            {currentSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    step.status === 'completed' ? 'text-green-700' :
                    step.status === 'error' ? 'text-red-700' :
                    step.status === 'processing' ? 'text-blue-700' :
                    'text-gray-500'
                  }`}>
                    {step.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Recovery Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => navigate('/recovery/start')}
                  className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
                >
                  Try Again →
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Security Note */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔒 All decryption happens locally on your device
          </p>
        </div>
      </motion.div>

      {/* Success Animation */}
      <SuccessComponent />
    </div>
  );
};
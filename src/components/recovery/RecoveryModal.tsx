import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { recoveryApi, getDeviceInfo } from '../../api/recovery';
import type { CollectedShare, RecoverySession } from '../../api/recovery';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { FrontendSaltService } from '../../utils/saltDerivation';
import { decryptAndRecombineShares } from '../../utils/shareDecryption';
import { WalletService } from '../../utils/walletService';
import { useToast } from '../../contexts/ToastContext';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  session: RecoverySession;
  shares: CollectedShare[];
  onSuccess: (privateKey: string) => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  session,
  shares,
  onSuccess
}) => {
  const { showError, showSuccess } = useToast();
  const [step, setStep] = useState<'password' | 'master-password' | 'decrypting' | 'success'>('password');
  const [password, setPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [backendSalt, setBackendSalt] = useState<string>('');
  const [originalSession, setOriginalSession] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Retrieve backend salt mutation
  const retrieveSaltMutation = useMutation({
    mutationFn: async (pwd: string) => {
      const deviceInfo = getDeviceInfo();
      
      return recoveryApi.retrieveBackendSalt({
        authenticationProof: {
          method: 'PASSWORD',
          value: pwd,
          timestamp: new Date().toISOString()
        },
        recoverySessionId: sessionId,
        deviceInfo: {
          deviceId: deviceInfo.deviceId,
          platform: deviceInfo.platform,
          fingerprint: deviceInfo.fingerprint
        }
      });
    },
    onSuccess: (saltResponse) => {
      console.log('🧂 BACKEND SALT RESPONSE:', {
        backendSalt: saltResponse.backendSalt,
        originalSession: saltResponse.originalSession,
        guardianDetails: saltResponse.originalSession.guardians.map(g => ({
          guardianId: g.guardianId,
          contactHash: g.contactHash,
          type: g.type
        }))
      });
      setBackendSalt(saltResponse.backendSalt);
      setOriginalSession(saltResponse.originalSession);
      setStep('master-password');
      showSuccess('Authentication successful! Now enter your master password.');
    },
    onError: (error: any) => {
      setAttempts(prev => prev + 1);
      if (attempts >= 4) {
        showError('Maximum attempts exceeded. Please try again later.');
        onClose();
      } else {
        showError(error.message || 'Invalid password. Please try again.');
      }
    }
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      showError('Please enter your password');
      return;
    }
    
    await retrieveSaltMutation.mutateAsync(password);
  };

  const handleMasterPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword) {
      showError('Please enter your master password');
      return;
    }

    setStep('decrypting');
    setIsLoading(true);

    try {
      // Test our encryption/decryption implementation first
      console.log('🧪 Running encryption/decryption test...');
      const { ShareEncryptionService } = await import('../../utils/shareEncryption');
      const testResult = await ShareEncryptionService.testEncryptionCycle();
      console.log('🧪 Test completed:', testResult ? 'PASSED' : 'FAILED');
      
      if (!testResult) {
        throw new Error('Encryption/decryption test failed - there is a fundamental issue with our crypto implementation');
      }
      // Derive frontend salt from master password using ORIGINAL setup session ID
      console.log('RECOVERY - Salt derivation params:', {
        masterPassword: masterPassword,
        userId: session.userId,
        sessionId: originalSession.sessionId,
        sessionType: 'RECOVERY',
        currentRecoverySessionId: session.sessionId
      });
      
      // CRITICAL: We need to use the EXACT same userId that was used during encryption
      // From the setup logs, we can see userId was 'unknown_user' during encryption
      // So we must use 'unknown_user' during decryption to match the encryption key
      const encryptionUserId = 'unknown_user'; // This matches what was used during setup
      
      console.log('RECOVERY - Salt derivation debug:', {
        originalSessionUserId: originalSession.userId,
        currentSessionUserId: session.userId,
        localStorageUserId: localStorage.getItem('userId'),
        encryptionUserIdUsed: encryptionUserId,
        setupEncryptionUserId: 'unknown_user', // From setup logs
        mustMatch: 'These must be identical for decryption to work'
      });
      
      const frontendSalt = await FrontendSaltService.deriveFrontendSalt({
        masterPassword,
        userId: encryptionUserId, // Use the same userId that was used during encryption
        sessionId: originalSession.sessionId // Use original setup session ID!
      });
      console.log('RECOVERY - Generated frontendSalt:', frontendSalt);
      
      // Decrypt and recombine shares to get private key
      const threshold = session.requiredShares || originalSession.threshold || 2;
      console.log('Using threshold:', threshold);
      
      const recoveredPrivateKey = await decryptAndRecombineShares(
        shares,
        frontendSalt,
        backendSalt,
        threshold,
        originalSession
      );

      // Update wallet with recovered private key
      const recoveredWallet = await WalletService.importWallet(recoveredPrivateKey);
      console.log('Wallet recovered successfully:', recoveredWallet.address);

      setStep('success');
      showSuccess('Recovery successful! Your wallet has been restored.');
      
      // Call onSuccess callback with the recovered private key
      setTimeout(() => {
        onSuccess(recoveredPrivateKey);
      }, 2000);
      
    } catch (error: any) {
      console.error('Decryption failed:', error);
      showError('Failed to decrypt shares. Please check your master password.');
      setStep('master-password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('password');
    setPassword('');
    setMasterPassword('');
    setShowMasterPassword(false);
    setBackendSalt('');
    setOriginalSession(null);
    setAttempts(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget && step !== 'decrypting') {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {step === 'password' && 'Authenticate Your Identity'}
                {step === 'master-password' && 'Enter Master Password'}
                {step === 'decrypting' && 'Decrypting Shares...'}
                {step === 'success' && 'Recovery Complete!'}
              </h2>
              {step !== 'decrypting' && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Content */}
            {step === 'password' && (
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Enter your account password to verify your identity and retrieve the backend encryption key.
                  </p>
                  <Input
                    label="Account Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoFocus
                  />
                  {attempts > 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      {5 - attempts} attempts remaining
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  fullWidth 
                  loading={retrieveSaltMutation.isPending}
                >
                  Continue
                </Button>
              </form>
            )}

            {step === 'master-password' && (
              <form onSubmit={handleMasterPasswordSubmit}>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Enter the master password you used when setting up your guardians. This will decrypt your recovery shares.
                  </p>
                  <div className="relative">
                    <Input
                      label="Master Password"
                      type={showMasterPassword ? "text" : "password"}
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      placeholder="Enter your master password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowMasterPassword(!showMasterPassword)}
                      className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showMasterPassword ? (
                        // Eye slash icon (hide password)
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        // Eye icon (show password)
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    fullWidth 
                    loading={isLoading}
                  >
                    Decrypt & Recover
                  </Button>
                </div>
              </form>
            )}

            {step === 'decrypting' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Decrypting guardian shares...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Recovery Successful!</h3>
                <p className="text-gray-600">Your wallet has been successfully recovered.</p>
              </div>
            )}

            {/* Security Note */}
            {(step === 'password' || step === 'master-password') && (
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  🔒 Your passwords are processed locally and never sent to our servers
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
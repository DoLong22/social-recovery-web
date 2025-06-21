import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { recoveryApi, getDeviceInfo } from '../api/recovery';
import type { CollectedShare, RecoverySession } from '../api/recovery';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { FrontendSaltService } from '../utils/saltDerivation';

export const RecoveryAuthentication: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError, showSuccess } = useToast();
  
  // Get shares and session from navigation state
  const stateData = location.state as { 
    shares: CollectedShare[]; 
    session: RecoverySession;
  } | null;

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState<string>('');
  const [shares, setShares] = useState<CollectedShare[] | null>(stateData?.shares || null);
  const [session, setSession] = useState<RecoverySession | null>(stateData?.session || null);

  // Query to fetch session and shares if not provided in state
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['recoverySession', sessionId],
    queryFn: () => recoveryApi.getRecoveryStatus(sessionId!),
    enabled: !!sessionId && !session,
  });

  const { data: sharesData, isLoading: sharesLoading, error: sharesError } = useQuery({
    queryKey: ['recoveryShares', sessionId],
    queryFn: () => recoveryApi.getCollectedShares(sessionId!),
    enabled: !!sessionId && !shares && (sessionData?.approvalsDetailed?.received || 0) >= (sessionData?.approvalsDetailed?.required || 2),
  });

  // Update state when data is fetched
  useEffect(() => {
    if (sessionData && !session) {
      setSession(sessionData);
    }
  }, [sessionData, session]);

  useEffect(() => {
    if (sharesData && !shares) {
      setShares(sharesData);
      showSuccess('Guardian shares loaded successfully');
    }
  }, [sharesData, shares, showSuccess]);

  useEffect(() => {
    if (sharesError) {
      console.error('Failed to fetch shares:', sharesError);
      showError('Failed to load guardian shares');
    }
  }, [sharesError, showError]);

  // Check password strength
  const checkPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) {
      setPasswordStrength('');
      return;
    }
    
    try {
      FrontendSaltService.validatePasswordStrength(pwd);
      setPasswordStrength('strong');
    } catch (error) {
      if (pwd.length < 8) {
        setPasswordStrength('weak');
      } else if (pwd.length < 12) {
        setPasswordStrength('medium');
      } else {
        setPasswordStrength('medium');
      }
    }
  };

  const retrieveSaltMutation = useMutation({
    mutationFn: async (password: string) => {
      const deviceInfo = getDeviceInfo();
      
      return recoveryApi.retrieveBackendSalt({
        authenticationProof: {
          method: 'PASSWORD',
          value: password,
          timestamp: new Date().toISOString()
        },
        recoverySessionId: sessionId!,
        deviceInfo: {
          deviceId: deviceInfo.deviceId,
          platform: deviceInfo.platform,
          fingerprint: deviceInfo.fingerprint
        }
      });
    },
    onSuccess: (saltResponse) => {
      // Navigate to decryption screen with all necessary data
      navigate(`/recovery/decrypt/${sessionId}`, {
        state: {
          backendSalt: saltResponse.backendSalt,
          setupTimestamp: saltResponse.originalSession.setupTimestamp,
          guardianConfiguration: saltResponse.originalSession.guardians,
          collectedShares: currentShares,
          password: password,
          sessionId: saltResponse.originalSession.sessionId
        }
      });
    },
    onError: (error: any) => {
      setAttempts(prev => prev + 1);
      
      if (error.message?.includes('Rate limit') || attempts >= 4) {
        showError('Too many attempts. Please try again in 1 hour.');
        setTimeout(() => navigate('/dashboard'), 3000);
      } else if (error.message?.includes('Invalid password') || error.message?.includes('UNAUTHORIZED')) {
        showError(`Incorrect password. ${5 - attempts - 1} attempts remaining.`);
      } else {
        showError('Authentication failed. Please try again.');
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      showError('Please enter your password');
      return;
    }

    if (attempts >= 5) {
      showError('Maximum attempts exceeded. Please try again later.');
      return;
    }

    await retrieveSaltMutation.mutateAsync(password);
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'strong':
        return 'text-green-600';
      default:
        return 'text-gray-400';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'Weak password';
      case 'medium':
        return 'Medium strength';
      case 'strong':
        return 'Strong password';
      default:
        return '';
    }
  };

  // Use either state data or fetched data
  const currentSession = session || sessionData;
  const currentShares = shares || sharesData;

  // Debug logging
  useEffect(() => {
    console.log('RecoveryAuthentication state:', {
      sessionId,
      hasShares: !!currentShares,
      sharesCount: currentShares?.length,
      hasSession: !!currentSession,
      sessionState: currentSession?.state,
      threshold: currentSession?.approvalsDetailed,
      isLoading: sessionLoading || sharesLoading,
      stateData,
      sessionData,
      sharesData
    });
  }, [sessionId, currentShares, currentSession, sessionLoading, sharesLoading, stateData, sessionData, sharesData]);

  // Handle loading states
  if (sessionLoading || sharesLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recovery data...</p>
        </div>
      </div>
    );
  }

  // Check if we have the required data
  if (!currentShares || !currentSession) {
    // If no session found, redirect to guardian dashboard
    if (!currentSession && !sessionLoading) {
      console.warn('No recovery session found');
      showError('No active recovery session found');
      navigate('/guardian-dashboard');
      return null;
    }
    
    // If session exists but no shares, check if threshold is met
    if (currentSession && !currentShares && !sharesLoading) {
      const thresholdMet = currentSession.approvalsDetailed?.received >= currentSession.approvalsDetailed?.required;
      if (!thresholdMet) {
        console.warn('Threshold not met yet');
        showError('Not enough guardian approvals yet');
        navigate(`/recovery/progress/${sessionId}`);
        return null;
      }
      
      // If threshold is met but still loading shares, show loading
      if (thresholdMet && sharesLoading) {
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading guardian shares...</p>
            </div>
          </div>
        );
      }
    }
    
    return null;
  }

  try {
    return (
      <div className="h-full bg-gradient-to-b from-gray-50 to-white p-4 flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto w-full"
        >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter Your Password</h1>
          <p className="text-gray-600">Your master password is required to decrypt the recovery shares</p>
        </div>

        {/* Success Info */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">
                {shares?.length || 0} guardian shares collected successfully!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Enter your password to complete recovery
              </p>
            </div>
          </div>
        </Card>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Master Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  checkPasswordStrength(e.target.value);
                }}
                placeholder="Enter your master password"
                className="pr-12"
                disabled={retrieveSaltMutation.isPending}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {passwordStrength && (
              <p className={`text-xs mt-1 ${getStrengthColor()}`}>
                {getStrengthText()}
              </p>
            )}
          </div>

          {/* Attempts Warning */}
          {attempts > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-800">
                ⚠️ {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining
              </p>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={retrieveSaltMutation.isPending}
            disabled={!password || attempts >= 5}
          >
            {retrieveSaltMutation.isPending ? 'Authenticating...' : 'Continue to Recovery'}
          </Button>
        </form>

        {/* Forgot Password */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Forgot your password?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Learn about recovery options
            </a>
          </p>
        </div>

        {/* Security Note */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            🔒 Your password is used locally to decrypt shares. It is never sent to our servers.
          </p>
        </div>
      </motion.div>
    </div>
  );
  } catch (error) {
    console.error('RecoveryAuthentication render error:', error);
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Page</h2>
          <p className="text-gray-600 mb-4">
            An error occurred while loading the authentication page.
          </p>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto mb-4">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
          <Button 
            onClick={() => navigate(`/recovery/progress/${sessionId}`)}
            variant="secondary"
          >
            Back to Recovery Progress
          </Button>
        </Card>
      </div>
    );
  }
};
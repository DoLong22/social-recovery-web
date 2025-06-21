import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { API_BASE_URL } from '../api/config';

// Create a portal to render outside the app container
import { createPortal } from 'react-dom';

interface ApprovalData {
  sessionId: string;
  guardianId: string;
  guardianContact: string;
  userInfo: {
    displayName: string;
    recoveryInitiated: string;
  };
  thresholdProgress: {
    received: number;
    required: number;
  };
  guardianStatus: {
    hasSubmitted: boolean;
    submittedAt?: string;
  };
  tokenData: {
    guardianContact: string;
  };
}

interface ShareResult {
  thresholdMet: boolean;
  sharesCollected: number;
  sharesRequired: number;
}

export const RecoveryApproval: React.FC = () => {
  // Fix body scroll for this page
  React.useEffect(() => {
    // Save original styles
    const originalStyles = {
      body: {
        display: document.body.style.display,
        alignItems: document.body.style.alignItems,
        justifyContent: document.body.style.justifyContent,
        height: document.body.style.height,
        minHeight: document.body.style.minHeight,
        overflow: document.body.style.overflow,
      },
      html: {
        height: document.documentElement.style.height,
        overflow: document.documentElement.style.overflow,
      },
      root: {
        height: document.getElementById('root')?.style.height || '',
        overflow: document.getElementById('root')?.style.overflow || '',
      }
    };

    // Override styles to enable scrolling
    document.body.style.display = 'block';
    document.body.style.alignItems = 'unset';
    document.body.style.justifyContent = 'unset';
    document.body.style.height = 'auto';
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'auto';
    
    document.documentElement.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    const root = document.getElementById('root');
    if (root) {
      root.style.height = 'auto';
      root.style.overflow = 'visible';
    }
    
    return () => {
      // Restore original styles
      document.body.style.display = originalStyles.body.display || 'flex';
      document.body.style.alignItems = originalStyles.body.alignItems || 'center';
      document.body.style.justifyContent = originalStyles.body.justifyContent || 'center';
      document.body.style.height = originalStyles.body.height || '100%';
      document.body.style.minHeight = originalStyles.body.minHeight || '100vh';
      document.body.style.overflow = originalStyles.body.overflow || '';
      
      document.documentElement.style.height = originalStyles.html.height || '100%';
      document.documentElement.style.overflow = originalStyles.html.overflow || '';
      
      if (root) {
        root.style.height = originalStyles.root.height || '100%';
        root.style.overflow = originalStyles.root.overflow || '';
      }
    };
  }, []);
  const [searchParams] = useSearchParams();
  // const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalData, setApprovalData] = useState<ApprovalData | null>(null);
  const [encryptedShare, setEncryptedShare] = useState('');
  const [submissionMethod, setSubmissionMethod] = useState<'paste' | 'file' | 'qr'>('paste');
  const [submitting, setSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get('token');

    if (!urlToken) {
      setError('Invalid approval link - missing token');
      setLoading(false);
      return;
    }

    setToken(urlToken);
    loadApprovalData(urlToken);
  }, [searchParams]);

  const loadApprovalData = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recovery/approve/${token}`);
      const result = await response.json();

      if (result.success) {
        setApprovalData(result.data);
      } else {
        setError(result.error?.message || 'Invalid or expired token');
      }
    } catch (err) {
      setError('Failed to load recovery request details');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!encryptedShare.trim() || !token) {
      showError('Please provide your encrypted share');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/recovery/approve/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encryptedShare,
          submissionMethod
        })
      });

      const result = await response.json();

      if (result.success) {
        setShareResult({
          thresholdMet: result.data.thresholdMet,
          sharesCollected: result.data.sharesCollected,
          sharesRequired: result.data.sharesRequired
        });
        setSubmissionComplete(true);
        showSuccess('Share submitted successfully!');
      } else {
        showError(result.error?.message || 'Failed to submit share');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setEncryptedShare(content.trim());
      };
      reader.readAsText(file);
    }
  };

  // Loading state
  if (loading) {
    const loadingContent = (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 10000
      }}>
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-blue-100 rounded-full"></div>
        </div>
      </div>
    );
    return createPortal(loadingContent, document.body);
  }

  // Error state
  if (error) {
    const errorContent = (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 10000
      }}>
        <Card className="text-center max-w-md w-full">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">⚠️ Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            {error.includes('expired') && (
              <p className="text-sm text-gray-500">This approval link has expired. Please request a new recovery link.</p>
            )}
            <Button onClick={() => window.location.reload()} variant="secondary">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
    return createPortal(errorContent, document.body);
  }

  // Success state
  if (submissionComplete && shareResult) {
    return (
      <div className="h-full bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <Card className="text-center max-w-md w-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
          >
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Share Submitted Successfully!</h2>
          <p className="text-gray-600 mb-4">Your guardian share has been submitted.</p>

          {shareResult.thresholdMet ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-green-800 mb-1">🎉 Recovery Threshold Met!</h3>
              <p className="text-sm text-green-700">
                All required shares have been collected. The account holder can now complete recovery.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-800 mb-1">Waiting for Other Guardians</h3>
              <p className="text-sm text-blue-700">
                {shareResult.sharesCollected} of {shareResult.sharesRequired} shares collected.
              </p>
            </div>
          )}

          <Button onClick={() => window.close()} variant="secondary">
            Close Window
          </Button>
        </Card>
      </div>
    );
  }

  // Already submitted state
  if (approvalData?.guardianStatus.hasSubmitted) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-md w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Share Already Submitted</h2>
          <p className="text-gray-600 mb-2">You have already submitted your share for this recovery request.</p>
          <p className="text-sm text-gray-500">
            Submitted on: {new Date(approvalData.guardianStatus.submittedAt!).toLocaleString()}
          </p>
        </Card>
      </div>
    );
  }

  // Main approval form
  if (approvalData && !approvalData.guardianStatus.hasSubmitted) {
    const progress = (approvalData.thresholdProgress.received / approvalData.thresholdProgress.required) * 100;

    // Create a portal container
    const portalContent = (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        backgroundColor: '#f9fafb',
        zIndex: 10000
      }}>
        <div className="bg-gradient-to-b from-gray-50 to-white" style={{ minHeight: '100vh' }}>
          <div className="max-w-2xl mx-auto p-4 pb-20">
          {/* Alert Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500 text-white p-6 rounded-xl text-center mb-6"
          >
            <h1 className="text-2xl font-bold mb-2">🚨 Account Recovery Request</h1>
            <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm">
              Action Required
            </span>
          </motion.div>

          {/* Request Info */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recovery Request Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Account:</span>
                <span className="font-medium text-gray-900">{approvalData.userInfo.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Initiated:</span>
                <span className="font-medium text-gray-900">
                  {new Date(approvalData.userInfo.recoveryInitiated).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Role:</span>
                <span className="font-medium text-gray-900">
                  Guardian ({approvalData.tokenData.guardianContact})
                </span>
              </div>
            </div>
          </Card>

          {/* Progress */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Progress</h3>
            <p className="text-sm text-gray-600 mb-3">
              {approvalData.thresholdProgress.received} of {approvalData.thresholdProgress.required} guardians have responded
            </p>
            <ProgressBar value={progress} className="h-3" />
          </Card>

          {/* Security Warning */}
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" 
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                    clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-amber-800">⚠️ Security Notice</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Only approve if you can verify this request is legitimate. Contact the account holder if you have doubts.
                </p>
              </div>
            </div>
          </Card>

          {/* Share Submission */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Guardian Share</h3>

            {/* Method Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  submissionMethod === 'paste' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSubmissionMethod('paste')}
              >
                Paste Share
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  submissionMethod === 'file' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSubmissionMethod('file')}
              >
                Upload File
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  submissionMethod === 'qr' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSubmissionMethod('qr')}
              >
                Scan QR Code
              </button>
            </div>

            {/* Input Methods */}
            <div className="mb-6">
              {submissionMethod === 'paste' && (
                <textarea
                  placeholder="Paste your encrypted share here..."
                  value={encryptedShare}
                  onChange={(e) => setEncryptedShare(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              )}

              {submissionMethod === 'file' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".txt,.json"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">TXT or JSON files only</p>
                  </label>
                  {encryptedShare && (
                    <p className="text-sm text-green-600 mt-3">✓ File loaded successfully</p>
                  )}
                </div>
              )}

              {submissionMethod === 'qr' && (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M8 20h2m-2-4v-4m0 4h2v-4m-2 0V8m0 0V4m0 4h2V4m-2 0h-.01M12 8h-.01M16 12h.01M8 12h.01M16 16h-.01M8 16h-.01" />
                  </svg>
                  <p className="text-gray-600">QR Scanner coming soon</p>
                  <p className="text-sm text-gray-500 mt-2">Please use paste or file upload for now</p>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !encryptedShare.trim()}
              loading={submitting}
              fullWidth
              size="lg"
            >
              {submitting ? 'Submitting...' : 'Submit Share & Approve Recovery'}
            </Button>
          </Card>
        </div>
      </div>
      </div>
    );

    // Render using portal to escape app container restrictions
    return createPortal(portalContent, document.body);
  }

  return null;
};
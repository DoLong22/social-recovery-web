import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { WalletService } from '../utils/walletService';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [privateKey, setPrivateKey] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [importKey, setImportKey] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Load wallet data on mount
  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = () => {
    const wallet = WalletService.getWallet();
    if (wallet) {
      setPrivateKey(wallet.privateKey);
      setAddress(wallet.address);
    }
  };

  const handleGenerateWallet = async () => {
    setIsGenerating(true);
    try {
      const wallet = await WalletService.generateWallet();
      setPrivateKey(wallet.privateKey);
      setAddress(wallet.address);
      showSuccess('New wallet generated successfully!');
    } catch (error) {
      showError('Failed to generate wallet');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportWallet = async () => {
    if (!importKey) {
      showError('Please enter a private key');
      return;
    }

    try {
      const wallet = await WalletService.importWallet(importKey);
      setPrivateKey(wallet.privateKey);
      setAddress(wallet.address);
      setShowImportModal(false);
      setImportKey('');
      showSuccess('Wallet imported successfully!');
    } catch (error: any) {
      showError(error.message || 'Invalid private key');
    }
  };

  const handleClearWallet = () => {
    if (confirm('Are you sure you want to clear your wallet? This cannot be undone!')) {
      WalletService.clearWallet();
      setPrivateKey('');
      setAddress('');
      showSuccess('Wallet cleared from local storage');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(`${label} copied to clipboard`);
  };

  const hasWallet = !!privateKey;

  return (
    <div className="h-full bg-gradient-to-b from-gray-50 to-white p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Wallet Profile</h1>
          <button
            onClick={() => navigate('/guardian-dashboard')}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!hasWallet ? (
          /* No Wallet State */
          <Card className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💰</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Wallet Found</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Generate a new wallet or import an existing one to start using social recovery features.
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                onClick={handleGenerateWallet}
                loading={isGenerating}
              >
                Generate New Wallet
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowImportModal(true)}
              >
                Import Wallet
              </Button>
            </div>
          </Card>
        ) : (
          /* Wallet Details */
          <div className="space-y-6">
            {/* Address Card */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Address</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-700">{address}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(address, 'Address')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Private Key Card */}
            <Card className="border-orange-200 bg-orange-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Private Key</h3>
                <span className="text-xs px-2 py-1 bg-orange-200 text-orange-800 rounded-full">
                  ⚠️ Keep Secret
                </span>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-700 flex-1 mr-2">
                    {showPrivateKey ? privateKey : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                    >
                      {showPrivateKey ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </Button>
                    {showPrivateKey && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(privateKey, 'Private key')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-orange-700 mt-3">
                ⚠️ Never share your private key with anyone. This key controls your wallet.
              </p>
            </Card>

            {/* Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <Button
                  fullWidth
                  onClick={() => navigate('/setup')}
                  className="justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Setup Guardian Recovery
                </Button>
                
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => {
                    const wallet = WalletService.exportWallet();
                    if (wallet) {
                      const data = `Wallet Backup\n\nAddress: ${wallet.address}\nPrivate Key: ${wallet.privateKey}\n\n⚠️ Keep this file secure!`;
                      const blob = new Blob([data], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `wallet-backup-${Date.now()}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                      showSuccess('Wallet backup downloaded');
                    }
                  }}
                  className="justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Wallet Backup
                </Button>
                
                <Button
                  fullWidth
                  variant="danger"
                  onClick={handleClearWallet}
                  className="justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Wallet
                </Button>
              </div>
            </Card>

            {/* Security Info */}
            <Card className="bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🔒 Security Information</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Your private key is stored locally in your browser
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  It is never sent to our servers
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Only encrypted shares are distributed to guardians
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  You need your master password + guardian shares to recover
                </li>
              </ul>
            </Card>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowImportModal(false);
                setImportKey('');
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Wallet</h3>
              <Input
                label="Private Key"
                type="password"
                value={importKey}
                onChange={(e) => setImportKey(e.target.value)}
                placeholder="Enter your private key"
                className="mb-4"
              />
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportKey('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImportWallet}
                  fullWidth
                >
                  Import
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
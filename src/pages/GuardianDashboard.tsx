import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { guardianApi } from '../api/guardian';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { SwipeableGuardianCard } from '../components/guardian/SwipeableGuardianCard';
import { GuardianDetailsModal } from '../components/guardian/GuardianDetailsModal';
import { GuardianSkeleton } from '../components/ui/Skeleton';
import { PullToRefresh } from '../components/ui/PullToRefresh';

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

export const GuardianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [selectedGuardian, setSelectedGuardian] = useState<GuardianData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Query guardians from API
  const { data: guardiansData, refetch: refetchGuardians, isLoading } = useQuery({
    queryKey: ['guardians'],
    queryFn: () => guardianApi.getGuardians(),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Query current session to show session guardians if no permanent guardians
  const { data: currentSession } = useQuery({
    queryKey: ['currentSession'],
    queryFn: () => guardianApi.getCurrentSession(),
    retry: false
  });

  // Query current version
  const { data: versionData } = useQuery({
    queryKey: ['currentVersion'],
    queryFn: () => guardianApi.getCurrentVersion()
  });

  const guardians = guardiansData?.data || [];
  const currentVersion = versionData?.data || { version: 'v1.0.0' };
  
  // Get guardian count from session if no permanent guardians
  const sessionGuardians = currentSession?.invitations || [];
  const activeGuardianCount = guardians.length > 0 ? 
    guardians.filter((g: GuardianData) => g.status === 'ACTIVE').length : 
    sessionGuardians.filter((g: any) => g.status === 'ACCEPTED').length;
  const totalGuardianCount = guardians.length > 0 ? guardians.length : sessionGuardians.length;

  // Health check mutation
  const healthCheckMutation = useMutation({
    mutationFn: () => guardianApi.bulkHealthCheck(),
    onSuccess: () => {
      showSuccess('Health check completed');
      refetchGuardians();
    },
    onError: () => {
      showError('Health check failed');
    }
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
    }
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


  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header with Navigation */}
      <div className="px-6 pt-safe-top pb-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Guardian Dashboard
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <PullToRefresh onRefresh={async () => {
        await refetchGuardians();
        showSuccess('Refreshed guardian list');
      }}>
        <div className="flex-1">
        {/* Status Overview */}
        <div className="px-6 py-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-4xl">🛡️</span>
                  <h2 className="text-2xl font-bold">Wallet Protected</h2>
                </div>
                <p className="text-blue-100">
                  {activeGuardianCount} Active Guardians
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Last check</p>
                <p className="font-medium">2 minutes ago</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/setup')}
              className="h-20 flex-col"
            >
              <span className="text-2xl mb-1">➕</span>
              <span>Add Guardian</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleHealthCheck}
              loading={healthCheckMutation.isPending}
              className="h-20 flex-col"
            >
              <span className="text-2xl mb-1">🔍</span>
              <span>Health Check</span>
            </Button>
          </div>
        </div>

        {/* Guardian List */}
        <div className="px-6 pb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Active Guardians</h3>
          
          {isLoading ? (
            <GuardianSkeleton />
          ) : totalGuardianCount === 0 ? (
            <EmptyState
              icon="👥"
              title="No Guardians Yet"
              description="Add guardians to secure your wallet"
              action={{
                label: "Add First Guardian",
                onClick: () => navigate('/setup')
              }}
            />
          ) : guardians.length > 0 ? (
            // Show permanent guardians
            <div className="space-y-3">
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
            <div className="space-y-3">
              {sessionGuardians.map((guardian, index) => (
                <motion.div
                  key={`session-${guardian.invitationId}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                        guardian.type === 'EMAIL' ? 'bg-blue-100' :
                        guardian.type === 'PHONE' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {guardian.type === 'EMAIL' ? '📧' :
                         guardian.type === 'PHONE' ? '📱' : '🔐'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{guardian.guardianName || 'Guardian'}</p>
                        <p className="text-sm text-gray-500">{guardian.contactInfo}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        guardian.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        guardian.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {guardian.status === 'ACCEPTED' ? 'Accepted' :
                         guardian.status === 'PENDING' ? 'Pending' : guardian.status}
                      </span>
                    </div>
                  </div>
                  {guardian.status === 'ACCEPTED' && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700">
                        ✅ Ready to secure your wallet! Complete setup to activate.
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Complete Setup Call-to-Action */}
              {currentSession?.status === 'ALL_ACCEPTED' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xl">🎉</span>
                    <p className="font-medium text-blue-900">All guardians accepted!</p>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Complete your setup to convert these to permanent guardians and secure your wallet.
                  </p>
                  <Button 
                    onClick={() => navigate('/session-monitoring')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Complete Setup Now →
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recovery Settings */}
        <div className="px-6 pb-8">
          <Card className="bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">Recovery Settings</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Minimum Required</span>
                <span className="font-medium">2 of {totalGuardianCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Version</span>
                <span className="font-medium">{currentVersion?.version || 'v1.0.0'}</span>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/sessions')}>
                📊 View History
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/recovery')}>
                🔄 Start Recovery
              </Button>
            </div>
          </Card>
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
    </div>
  );
};
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { guardianApi } from '../api/guardian';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';

export const SessionMonitoring: React.FC = () => {
  const navigate = useNavigate();

  // Query current session with polling
  const { data: currentSession, refetch } = useQuery({
    queryKey: ['currentSession'],
    queryFn: () => guardianApi.getCurrentSession(),
    refetchInterval: ({ state }) => {
      // Poll every 5 seconds if waiting for responses
      if (state.data?.status === 'WAITING_FOR_ALL' || state.data?.status === 'SOME_DECLINED') {
        return 5000;
      }
      return false;
    }
  });

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

  const progress = (currentSession.statistics.acceptedCount / currentSession.minimumAcceptances) * 100;
  const timeRemaining = currentSession.expiresAt 
    ? Math.max(0, new Date(currentSession.expiresAt).getTime() - Date.now())
    : 0;
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return '✅';
      case 'DECLINED':
        return '❌';
      case 'SENT':
        return '⏳';
      default:
        return '⏸️';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-safe-top pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">
          Invitation Status
        </h1>
        <p className="text-gray-600 mt-1">
          Waiting for guardian responses
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Status Overview */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentSession.status === 'WAITING_FOR_ALL' ? 'bg-yellow-100 text-yellow-800' :
              currentSession.status === 'ALL_ACCEPTED' ? 'bg-green-100 text-green-800' :
              currentSession.status === 'SOME_DECLINED' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentSession.status.replace(/_/g, ' ')}
            </span>
            
            {hoursRemaining > 0 && (
              <span className="text-sm text-gray-600">
                ⏱️ {hoursRemaining}h remaining
              </span>
            )}
          </div>

          <ProgressBar 
            value={progress} 
            showPercentage={true}
            className="mb-4"
          />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {currentSession.statistics.totalInvitations}
              </p>
              <p className="text-sm text-gray-600">Sent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {currentSession.statistics.acceptedCount}
              </p>
              <p className="text-sm text-gray-600">Accepted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {currentSession.statistics.pendingCount}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </Card>

        {/* Guardian List */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-gray-900">Guardian Responses</h3>
          {currentSession.invitations.map((invitation, index) => (
            <motion.div
              key={invitation.invitationId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card padding="sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getStatusIcon(invitation.status)}</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {invitation.contactInfo}
                      </p>
                      <p className="text-sm text-gray-600">{invitation.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(invitation.status)}`}>
                    {invitation.status}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={() => refetch()} variant="secondary" fullWidth>
            Refresh Status
          </Button>

          {currentSession.canProceed && (
            <Card className="bg-green-50 border-green-200">
              <p className="text-green-800 font-medium mb-3">
                ✓ Minimum acceptances reached! You can now proceed with the setup.
              </p>
              <Button 
                onClick={() => navigate('/guardian-dashboard')} 
                fullWidth
              >
                Complete Setup
              </Button>
            </Card>
          )}

          {currentSession.status === 'SOME_DECLINED' && (
            <Card className="bg-red-50 border-red-200">
              <p className="text-red-800 font-medium mb-3">
                ⚠️ Some guardians declined. You may need to add more guardians.
              </p>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/dashboard')}
                fullWidth
              >
                Manage Guardians
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { guardianApi } from '../api/guardian';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Query current session
  const { data: currentSession, isLoading: sessionLoading, error: sessionError } = useQuery({
    queryKey: ['currentSession'],
    queryFn: () => guardianApi.getCurrentSession(),
    retry: false
  });

  // Query guardians
  const { data: guardiansData, isLoading: guardiansLoading, error: guardiansError } = useQuery({
    queryKey: ['guardians'],
    queryFn: () => guardianApi.getGuardians(),
    retry: false
  });


  if (sessionLoading || guardiansLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error if both queries failed
  if (sessionError && guardiansError) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <Card className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to load dashboard data. Please check if the backend is running.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Session Error: {sessionError?.message}<br/>
            Guardians Error: {guardiansError?.message}
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const guardians = guardiansData?.data || [];
  const hasGuardians = guardians.length > 0;

  // Show session status if active (but not completed)
  if (currentSession && currentSession.status !== 'COMPLETED') {
    return (
      <div className="space-y-6">
        {/* Current Session Status */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Active Session</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentSession.status === 'ALL_ACCEPTED' ? 'bg-green-100 text-green-800' :
              currentSession.status === 'WAITING_FOR_ALL' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentSession.status.replace(/_/g, ' ')}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4">
            You have an active guardian setup session. 
            {currentSession.status === 'ALL_ACCEPTED' && ' All guardians have accepted!'}
            {currentSession.status === 'WAITING_FOR_ALL' && ' Waiting for guardian responses...'}
            {currentSession.status === 'SOME_DECLINED' && ' Some guardians have declined.'}
          </p>

          <div className="space-y-3">
            {currentSession.status === 'ALL_ACCEPTED' ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800 mb-2">
                    <span className="text-xl">🎉</span>
                    <p className="font-medium">Ready to complete setup!</p>
                  </div>
                  <p className="text-sm text-green-700">
                    All guardians have accepted. Complete your setup to secure your wallet.
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/session-monitoring')}
                  fullWidth
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Complete Setup Now →
                </Button>
              </>
            ) : currentSession.status === 'WAITING_FOR_ALL' || currentSession.status === 'SOME_DECLINED' ? (
              <Button onClick={() => navigate('/session-monitoring')} fullWidth>
                View Session Status
              </Button>
            ) : (
              <Button onClick={() => navigate('/guardian-dashboard')} fullWidth>
                View Guardian Dashboard
              </Button>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentSession.statistics.totalInvitations}</div>
              <div className="text-sm text-gray-600">Total Guardians</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentSession.statistics.acceptedCount}
              </div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
          </Card>
        </div>

        {/* Session Details */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Minimum Required:</span>
              <span className="font-medium">{currentSession.minimumAcceptances} guardians</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Can Proceed:</span>
              <span className={`font-medium ${currentSession.canProceed ? 'text-green-600' : 'text-red-600'}`}>
                {currentSession.canProceed ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">
                {new Date(currentSession.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show guardian dashboard if setup is complete but no active session
  if (hasGuardians) {
    return (
      <div className="space-y-6">
        {/* Welcome Back */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-600 mb-4">
            Your wallet is secured with {guardians.length} guardians.
          </p>
          <Button onClick={() => navigate('/guardian-dashboard')}>
            Manage Guardians
          </Button>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{guardians.length}</div>
              <div className="text-sm text-gray-600">Total Guardians</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {guardians.filter((g: any) => g.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-gray-600">Active Guardians</div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              fullWidth 
              variant="outline"
              onClick={() => navigate('/setup')}
            >
              🔧 Add More Guardians
            </Button>
            <Button 
              fullWidth 
              variant="secondary"
              onClick={() => navigate('/sessions')}
            >
              📊 View Session History
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show empty state if no guardians
  return (
    <div className="h-full flex items-center justify-center px-6">
      <EmptyState
        icon="🛡️"
        title="Welcome to Social Recovery"
        description="Secure your wallet by setting up trusted guardians who can help you recover access"
        action={{
          label: "Start Guardian Setup",
          onClick: () => navigate('/setup')
        }}
      />
    </div>
  );
};
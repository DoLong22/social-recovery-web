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
  const { data: currentSession, isLoading: sessionLoading } = useQuery({
    queryKey: ['currentSession'],
    queryFn: () => guardianApi.getCurrentSession(),
    retry: false
  });

  // Query guardians
  const { data: guardiansData, isLoading: guardiansLoading } = useQuery({
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

  const guardians = guardiansData?.data || [];
  const hasGuardians = guardians.length > 0;

  // Show session status if active
  if (currentSession) {
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
              {currentSession.status.replace('_', ' ')}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4">
            You have an active guardian setup session. 
            {currentSession.status === 'ALL_ACCEPTED' && ' All guardians have accepted!'}
            {currentSession.status === 'WAITING_FOR_ALL' && ' Waiting for guardian responses...'}
            {currentSession.status === 'SOME_DECLINED' && ' Some guardians have declined.'}
          </p>

          <div className="flex gap-3">
            {currentSession.status === 'WAITING_FOR_ALL' || currentSession.status === 'SOME_DECLINED' ? (
              <Button onClick={() => navigate('/session-monitoring')}>
                View Session Status
              </Button>
            ) : (
              <Button onClick={() => navigate('/guardian-dashboard')}>
                View Guardian Dashboard
              </Button>
            )}
          </div>
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
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guardianApi, SetupSessionStatus } from '../api/guardian';
import type { SetupSessionResponse } from '../api/guardian';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Sessions: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [selectedSession, setSelectedSession] = useState<SetupSessionResponse | null>(null);
  const [filter, setFilter] = useState<SetupSessionStatus | 'ALL'>('ALL');

  // Query session history
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['sessionHistory'],
    queryFn: () => guardianApi.getSessionHistory(),
  });

  // Cancel session mutation
  const cancelMutation = useMutation({
    mutationFn: (sessionId: string) => guardianApi.cancelSession(sessionId),
    onSuccess: () => {
      showSuccess('Session cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['sessionHistory'] });
      setSelectedSession(null);
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to cancel session');
    }
  });

  const filteredSessions = filter === 'ALL' 
    ? sessions 
    : sessions.filter(s => s.status === filter);

  const getStatusColor = (status: SetupSessionStatus) => {
    switch (status) {
      case SetupSessionStatus.WAITING_FOR_ALL:
        return 'bg-yellow-100 text-yellow-800';
      case SetupSessionStatus.ALL_ACCEPTED:
        return 'bg-green-100 text-green-800';
      case SetupSessionStatus.SOME_DECLINED:
        return 'bg-orange-100 text-orange-800';
      case SetupSessionStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case SetupSessionStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      case SetupSessionStatus.EXPIRED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-red-600">Failed to load sessions</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['sessionHistory'] })} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {(['ALL', ...Object.values(SetupSessionStatus)] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All' : status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600">No sessions found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Card
              key={session.sessionId}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedSession(session)}
              padding="sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600">Session ID</p>
                  <p className="font-mono text-xs">{session.sessionId}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(session.status)}`}>
                  {session.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium">{new Date(session.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Progress</p>
                  <p className="font-medium">
                    {session.statistics.acceptedCount}/{session.minimumAcceptances}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (session.statistics.acceptedCount / session.minimumAcceptances) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto animate-slideUp">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Session Details</h2>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Session Info */}
              <Card padding="sm">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(selectedSession.status)}`}>
                      {selectedSession.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium">
                      {new Date(selectedSession.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires</span>
                    <span className="font-medium">
                      {new Date(selectedSession.expiresAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Required</span>
                    <span className="font-medium">
                      {selectedSession.minimumAcceptances} of {selectedSession.statistics.totalInvitations}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Guardians */}
              <div>
                <h3 className="font-semibold mb-3">Guardians</h3>
                <div className="space-y-2">
                  {selectedSession.invitations.map((inv) => (
                    <Card key={inv.invitationId} padding="sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{inv.contactInfo}</p>
                          <p className="text-sm text-gray-600">{inv.type}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          inv.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          inv.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                          inv.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {(selectedSession.status === SetupSessionStatus.WAITING_FOR_ALL || 
                selectedSession.status === SetupSessionStatus.SOME_DECLINED) && (
                <Button
                  variant="danger"
                  fullWidth
                  loading={cancelMutation.isPending}
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this session?')) {
                      cancelMutation.mutate(selectedSession.sessionId);
                    }
                  }}
                >
                  Cancel Session
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
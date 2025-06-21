import React from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { guardianApi } from '../api/guardian';

export const SmartRedirect: React.FC = () => {
  // Query guardians to determine where to redirect
  const { data: guardians, isLoading: guardiansLoading } = useQuery({
    queryKey: ['guardians'],
    queryFn: () => guardianApi.getGuardians(),
    retry: false
  });

  // Query current session
  const { data: currentSession, isLoading: sessionLoading } = useQuery({
    queryKey: ['currentSession'],
    queryFn: () => guardianApi.getCurrentSession(),
    retry: false
  });
  console.log('currentSession: ', currentSession);

  // Show loading while checking
  if (guardiansLoading || sessionLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  console.log('guardians: ', guardians);
  const hasGuardians = guardians.length > 0;
  console.log('hasGuardians: ', hasGuardians);
  const hasActiveSession = currentSession && currentSession.status === 'COMPLETED';

  // If user has guardians and no active session, go to GuardianDashboard
  if (hasGuardians && hasActiveSession) {
    return <Navigate to="/guardian-dashboard" replace />;
  }

  // Otherwise, go to Dashboard
  return <Navigate to="/dashboard" replace />;
};
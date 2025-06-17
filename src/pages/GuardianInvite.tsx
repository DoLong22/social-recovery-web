import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { guardianApi } from '../api/guardian';
import type { AcceptInvitationDto, DeclineInvitationDto } from '../api/guardian';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { generatePublicKey } from '../utils/helpers';

export const GuardianInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [acceptData, setAcceptData] = useState({
    guardianName: '',
    publicKey: generatePublicKey(),
    agreedToTerms: false,
    understandsResponsibility: false
  });
  const [declineReason, setDeclineReason] = useState('');

  // Preview invitation
  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ['invitationPreview', token],
    queryFn: () => guardianApi.previewInvitation(token!),
    enabled: !!token
  });

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: (data: AcceptInvitationDto) => guardianApi.acceptInvitation(token!, data),
    onSuccess: () => {
      setShowAcceptForm(false);
    }
  });

  // Decline mutation
  const declineMutation = useMutation({
    mutationFn: (data: DeclineInvitationDto) => guardianApi.declineInvitation(token!, data),
    onSuccess: () => {
      setShowDeclineForm(false);
    }
  });

  const handleAccept = () => {
    const data: AcceptInvitationDto = {
      guardianName: acceptData.guardianName,
      publicKey: acceptData.publicKey,
      consent: {
        agreedToTerms: acceptData.agreedToTerms,
        understandsResponsibility: acceptData.understandsResponsibility,
        timestamp: new Date(),
        userAgent: navigator.userAgent
      }
    };
    acceptMutation.mutate(data);
  };

  const handleDecline = () => {
    const data: DeclineInvitationDto = {
      reason: declineReason,
      timestamp: new Date()
    };
    declineMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-md w-full">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600">This invitation link is invalid or has expired.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (acceptMutation.isSuccess) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-md w-full">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invitation Accepted!</h2>
            <p className="text-gray-600">You are now a guardian for this wallet.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (declineMutation.isSuccess) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-md w-full">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invitation Declined</h2>
            <p className="text-gray-600">Thank you for your response.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-sm w-full space-y-6 animate-slideUp py-8">
        {/* Invitation Preview */}
        {!showAcceptForm && !showDeclineForm && (
          <>
            <Card className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Guardian Invitation</h1>
                <p className="text-gray-600">You've been invited to be a guardian</p>
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-medium">{invitation.walletOwner || 'Wallet Owner'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Message</p>
                  <p className="font-medium">{invitation.message || 'Please help me secure my wallet'}</p>
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowDeclineForm(true)}
              >
                Decline
              </Button>
              <Button
                fullWidth
                onClick={() => setShowAcceptForm(true)}
              >
                Accept
              </Button>
            </div>
          </>
        )}

        {/* Accept Form */}
        {showAcceptForm && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Accept Invitation</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAccept(); }} className="space-y-4">
              <Input
                label="Your Name"
                value={acceptData.guardianName}
                onChange={(e) => setAcceptData({ ...acceptData, guardianName: e.target.value })}
                placeholder="Enter your name"
                required
              />

              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={acceptData.agreedToTerms}
                    onChange={(e) => setAcceptData({ ...acceptData, agreedToTerms: e.target.checked })}
                    className="mt-1 mr-3"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the terms and conditions of being a guardian
                  </span>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={acceptData.understandsResponsibility}
                    onChange={(e) => setAcceptData({ ...acceptData, understandsResponsibility: e.target.checked })}
                    className="mt-1 mr-3"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I understand my responsibility to help recover this wallet when needed
                  </span>
                </label>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  onClick={() => setShowAcceptForm(false)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  loading={acceptMutation.isPending}
                  disabled={!acceptData.agreedToTerms || !acceptData.understandsResponsibility}
                >
                  Confirm Accept
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Decline Form */}
        {showDeclineForm && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Decline Invitation</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); handleDecline(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for declining (optional)
                </label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30"
                  placeholder="Let them know why you're declining..."
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  onClick={() => setShowDeclineForm(false)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  fullWidth
                  loading={declineMutation.isPending}
                >
                  Confirm Decline
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};
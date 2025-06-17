import { apiClient } from './client';
import { ENDPOINTS } from './config';

// Types
export const GuardianType = {
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  WALLET: 'WALLET',
  HARDWARE: 'HARDWARE',
  ORGANIZATION: 'ORGANIZATION',
  PRINT: 'PRINT',
} as const;

export type GuardianType = typeof GuardianType[keyof typeof GuardianType];

export const InvitationStatus = {
  SENT: 'SENT',
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const;

export type InvitationStatus = typeof InvitationStatus[keyof typeof InvitationStatus];

export const SetupSessionStatus = {
  WAITING_FOR_ALL: 'WAITING_FOR_ALL',
  ALL_ACCEPTED: 'ALL_ACCEPTED',
  SOME_DECLINED: 'SOME_DECLINED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
} as const;

export type SetupSessionStatus = typeof SetupSessionStatus[keyof typeof SetupSessionStatus];

export const DeclineAction = {
  SEND_NEW_INVITATION: 'SEND_NEW_INVITATION',
  ADJUST_THRESHOLD: 'ADJUST_THRESHOLD',
  WAIT_FOR_OTHERS: 'WAIT_FOR_OTHERS',
  CANCEL_SESSION: 'CANCEL_SESSION',
} as const;

export type DeclineAction = typeof DeclineAction[keyof typeof DeclineAction];

// DTOs
export interface CreateSetupSessionDto {
  guardians: Array<{
    type: GuardianType;
    contactInfo: string;
    name: string;
    invitationMessage?: string;
    notes?: string;
  }>;
  minimumAcceptances: number;
  sessionMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface SetupSessionResponse {
  sessionId: string;
  status: SetupSessionStatus;
  minimumAcceptances: number;
  canProceed: boolean;
  createdAt: string;
  expiresAt: string;
  statistics: {
    totalInvitations: number;
    acceptedCount: number;
    declinedCount: number;
    pendingCount: number;
    expiredCount: number;
  };
  invitations: Array<{
    invitationId: string;
    contactInfo: string;
    type: GuardianType;
    status: InvitationStatus;
    sentAt: string;
    expiresAt: string;
    respondedAt?: string;
    guardianName?: string; // Added from backend enhancement
  }>;
  completionDetails?: any;
  nextSteps: string[];
}

export interface AcceptInvitationDto {
  guardianName: string;
  publicKey: string;
  consent: {
    agreedToTerms: boolean;
    understandsResponsibility: boolean;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface DeclineInvitationDto {
  reason: string;
  timestamp: Date;
  feedback?: string;
  metadata?: Record<string, unknown>;
}

export interface HandleDeclineDto {
  action: DeclineAction;
  newGuardianContact?: string;
  newGuardianName?: string;
  newThreshold?: number;
  reason?: string;
  notifyOthers?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ProceedSetupDto {
  confirmProceed: boolean;
  reason?: string;
  cancelPending?: boolean;
  metadata?: Record<string, unknown>;
}

// API methods
export const guardianApi = {
  // Setup sessions
  async createSetupSession(data: CreateSetupSessionDto): Promise<SetupSessionResponse> {
    return apiClient.post(ENDPOINTS.SETUP_SESSION.CREATE, data);
  },

  async getCurrentSession(): Promise<SetupSessionResponse | null> {
    return apiClient.get(ENDPOINTS.SETUP_SESSION.CURRENT);
  },

  async getSessionHistory(): Promise<SetupSessionResponse[]> {
    return apiClient.get(ENDPOINTS.SETUP_SESSION.HISTORY);
  },

  async getSessionStatus(sessionId: string): Promise<SetupSessionResponse> {
    return apiClient.get(ENDPOINTS.SETUP_SESSION.STATUS(sessionId));
  },

  async proceedWithSetup(sessionId: string, data: ProceedSetupDto): Promise<any> {
    return apiClient.post(ENDPOINTS.SETUP_SESSION.PROCEED(sessionId), data);
  },

  async handleDecline(sessionId: string, data: HandleDeclineDto): Promise<any> {
    return apiClient.post(ENDPOINTS.SETUP_SESSION.HANDLE_DECLINE(sessionId), data);
  },

  async cancelSession(sessionId: string): Promise<void> {
    return apiClient.post(ENDPOINTS.SETUP_SESSION.CANCEL(sessionId), {});
  },

  // Invitations
  async previewInvitation(token: string): Promise<any> {
    return apiClient.get(ENDPOINTS.GUARDIAN.PREVIEW_INVITATION(token));
  },

  async acceptInvitation(token: string, data: AcceptInvitationDto): Promise<any> {
    return apiClient.post(ENDPOINTS.GUARDIAN.ACCEPT_INVITATION(token), data);
  },

  async declineInvitation(token: string, data: DeclineInvitationDto): Promise<any> {
    return apiClient.post(ENDPOINTS.GUARDIAN.DECLINE_INVITATION(token), data);
  },

  // Guardians management
  async getGuardians(limit?: number, offset?: number): Promise<any> {
    return apiClient.get('/guardians', { params: { limit, offset } });
  },

  async getGuardianById(id: string): Promise<any> {
    return apiClient.get(`/guardians/${id}`);
  },

  async updateGuardian(id: string, data: any): Promise<any> {
    return apiClient.put(`/guardians/${id}`, data);
  },

  async deleteGuardian(id: string): Promise<any> {
    return apiClient.delete(`/guardians/${id}`);
  },

  async checkGuardianHealth(id: string): Promise<any> {
    return apiClient.get(`/guardians/${id}/health`);
  },

  async bulkHealthCheck(): Promise<any> {
    return apiClient.post('/guardians/health-check', {});
  },

  // Version management
  async getCurrentVersion(): Promise<any> {
    return apiClient.get('/guardian/version/current/active');
  },

  async getVersionHistory(): Promise<any> {
    return apiClient.get('/guardian/version');
  },
};
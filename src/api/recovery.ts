import { apiClient } from './client';
import { ENDPOINTS } from './config';

// Types
export interface DeviceInfo {
  deviceId: string;
  platform: 'ios' | 'android' | 'web';
  deviceName?: string;
  fingerprint?: string;
  location?: {
    country?: string;
    city?: string;
  };
}

export interface InitiateRecoveryDto {
  deviceInfo: DeviceInfo;
  reason?: string;
}

export interface RecoverySession {
  sessionId: string;
  userId: string;
  state: 'initiated' | 'notified' | 'approving' | 'approved' | 'completing' | 'completed' | 'failed' | 'expired' | 'cancelled';
  requiredShares: number;
  receivedShares: number;
  expiresAt: string;
  createdAt: string;
  deviceInfo: DeviceInfo;
  approvalsDetailed: {
    required: number;
    received: number;
    guardians: Array<{
      guardianId: string;
      name: string;
      type: string;
      hasSubmitted: boolean;
      submittedAt?: string;
    }>;
  };
}

export interface CollectedShare {
  guardianId: string;
  encryptedShare: string;
  submittedAt: string;
  verificationStatus: 'verified' | 'pending';
}

export interface RetrieveSaltDto {
  authenticationProof: {
    method: 'PASSWORD';
    value: string;
    timestamp: string;
  };
  recoverySessionId: string;
  deviceInfo: {
    deviceId: string;
    platform: string;
    fingerprint?: string;
  };
}

export interface BackendSaltResponse {
  backendSalt: string;
  originalSession: {
    sessionId: string;
    setupTimestamp: number;
    userId: string;
    threshold: number;
    guardians: Array<{
      guardianId: string;
      contactHash: string;
      type: string;
    }>;
  };
  retrievalCount: number;
  maxRetrievals: number;
}

export interface SubmitShareDto {
  recoverySessionId: string;
  guardianId: string;
  encryptedShare: string;
  verificationCode: string;
  metadata?: {
    submissionMethod: string;
    deviceInfo?: {
      userAgent: string;
      platform: string;
    };
  };
}

// API methods
export const recoveryApi = {
  // Initiate recovery
  async initiateRecovery(data: InitiateRecoveryDto): Promise<RecoverySession> {
    return apiClient.post(ENDPOINTS.RECOVERY.INITIATE, data);
  },

  // Get recovery session status
  async getRecoveryStatus(sessionId: string): Promise<RecoverySession> {
    return apiClient.get(ENDPOINTS.RECOVERY.STATUS(sessionId));
  },

  // Get collected shares
  async getCollectedShares(sessionId: string): Promise<CollectedShare[]> {
    return apiClient.get(ENDPOINTS.RECOVERY.SHARES(sessionId));
  },

  // Retrieve backend salt
  async retrieveBackendSalt(data: RetrieveSaltDto): Promise<BackendSaltResponse> {
    return apiClient.post(ENDPOINTS.RECOVERY.RETRIEVE_SALT, data);
  },

  // Submit guardian share (no auth required)
  async submitGuardianShare(data: SubmitShareDto): Promise<void> {
    return apiClient.post(ENDPOINTS.RECOVERY.SUBMIT_SHARE, data);
  },

  // Cancel recovery session
  async cancelRecovery(sessionId: string): Promise<void> {
    return apiClient.post(ENDPOINTS.RECOVERY.CANCEL(sessionId), {});
  },

  // Get active recovery sessions
  async getActiveRecoverySessions(): Promise<RecoverySession[]> {
    return apiClient.get(ENDPOINTS.RECOVERY.ACTIVE);
  }
};

// Helper functions
export function getDeviceInfo(): DeviceInfo {
  const deviceId = localStorage.getItem('deviceId') || generateDeviceId();

  return {
    deviceId,
    platform: 'web',
    deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
    fingerprint: generateFingerprint()
  };
}

function generateDeviceId(): string {
  const id = 'web_' + crypto.getRandomValues(new Uint32Array(1))[0].toString(36) + '_' + Date.now().toString(36);
  localStorage.setItem('deviceId', id);
  return id;
}

function generateFingerprint(): string {
  // Simple fingerprinting based on browser features
  const features = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0
  ];

  return btoa(features.join('|')).substring(0, 20);
}

// Monitoring helper
export function monitorRecovery(
  sessionId: string,
  onUpdate: (status: RecoverySession) => void,
  interval: number = 5000
): () => void {
  const intervalId = setInterval(async () => {
    try {
      const status = await recoveryApi.getRecoveryStatus(sessionId);
      onUpdate(status);

      // Stop polling if completed or failed
      if (['completed', 'failed', 'expired'].includes(status.state)) {
        clearInterval(intervalId);
      }
    } catch (error) {
      console.error('Failed to get recovery status:', error);
    }
  }, interval);

  return () => clearInterval(intervalId);
}
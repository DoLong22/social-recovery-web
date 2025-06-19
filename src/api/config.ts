export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api/v1';
export const API_TIMEOUT = 30000;

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  
  // Guardian Invitations
  GUARDIAN: {
    INVITATIONS: '/guardian/invitations',
    ACCEPT_INVITATION: (token: string) => `/guardian/invitations/accept/${token}`,
    DECLINE_INVITATION: (token: string) => `/guardian/invitations/decline/${token}`,
    PREVIEW_INVITATION: (token: string) => `/guardian/invitations/preview/${token}`,
    CANCEL_INVITATION: (id: string) => `/guardian/invitations/${id}/cancel`,
    INVITATION_STATUS: '/guardian/invitations/status',
  },
  
  // Guardian Setup Sessions
  SETUP_SESSION: {
    CREATE: '/guardian/setup-sessions',
    CURRENT: '/guardian/setup-sessions/current',
    HISTORY: '/guardian/setup-sessions/history',
    STATUS: (id: string) => `/guardian/setup-sessions/${id}/status`,
    PROCEED: (id: string) => `/guardian/setup-sessions/${id}/proceed`,
    PREPARE: (id: string) => `/guardian/setup-sessions/${id}/prepare`,
    DISTRIBUTE: (id: string) => `/guardian/setup-sessions/${id}/distribute`,
    HANDLE_DECLINE: (id: string) => `/guardian/setup-sessions/${id}/handle-decline`,
    CANCEL: (id: string) => `/guardian/setup-sessions/${id}/cancel`,
  },
  
  // Recovery
  RECOVERY: {
    RETRIEVE_SALT: '/recovery/retrieve-salt',
  },
} as const;
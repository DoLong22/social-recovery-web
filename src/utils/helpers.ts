// Helper function to generate a valid public key
export function generatePublicKey(prefix = 'guardian'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  // Generate a 64-character hex string (32 bytes)
  const baseKey = `${prefix}_${timestamp}_${random}`.padEnd(32, '0');
  return Array.from(baseKey)
    .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 64);
}

// Format date helper
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Guardian type display helper
export function getGuardianTypeDisplay(type: string): string {
  const typeMap: Record<string, string> = {
    'EMAIL': '📧 Email',
    'PHONE': '📱 Phone',
    'WALLET': '💰 Wallet',
    'HARDWARE': '🔐 Hardware',
    'ORGANIZATION': '🏢 Organization',
    'PRINT': '🖨️ Print'
  };
  return typeMap[type] || type;
}

// Session status display helper
export function getSessionStatusDisplay(status: string): string {
  const statusMap: Record<string, string> = {
    'WAITING_FOR_ALL': 'Waiting for Guardians',
    'ALL_ACCEPTED': 'All Accepted',
    'SOME_DECLINED': 'Some Declined',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled',
    'EXPIRED': 'Expired',
    'FAILED': 'Failed'
  };
  return statusMap[status] || status;
}

// Invitation status display helper
export function getInvitationStatusDisplay(status: string): string {
  const statusMap: Record<string, string> = {
    'SENT': '📤 Sent',
    'PENDING': '⏳ Pending',
    'ACCEPTED': '✅ Accepted',
    'DECLINED': '❌ Declined',
    'EXPIRED': '⌛ Expired'
  };
  return statusMap[status] || status;
}
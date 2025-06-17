// Guardian status display helpers

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'ACCEPTED':
      return '✅';
    case 'DECLINED':
      return '❌';
    case 'SENT':
      return '📧';
    case 'EXPIRED':
      return '⌛';
    default:
      return '⏳';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACCEPTED':
      return 'text-green-600';
    case 'DECLINED':
      return 'text-red-600';
    case 'SENT':
      return 'text-blue-600';
    case 'EXPIRED':
      return 'text-gray-400';
    default:
      return 'text-gray-600';
  }
};

export const getTimeSinceDate = (dateStr: string) => {
  const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

export const formatGuardianDisplay = (contactInfo: string, guardianName?: string) => {
  if (guardianName) {
    return `${guardianName} (${contactInfo})`;
  }
  return contactInfo;
};
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
};

export const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check for minimum length (adjustable based on country)
  if (digitsOnly.length < 9) {
    return { valid: false, error: 'Phone number too short' };
  }
  
  if (digitsOnly.length > 15) {
    return { valid: false, error: 'Phone number too long' };
  }
  
  return { valid: true };
};

export const validateWalletAddress = (address: string): { valid: boolean; error?: string } => {
  if (!address) {
    return { valid: false, error: 'Wallet address is required' };
  }
  
  // Basic Ethereum address validation (0x + 40 hex chars)
  const ethRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethRegex.test(address)) {
    return { valid: false, error: 'Invalid wallet address format' };
  }
  
  return { valid: true };
};

export const formatPhoneNumber = (phone: string, countryCode: string = '+84'): string => {
  // Remove all non-digit characters
  let digitsOnly = phone.replace(/\D/g, '');
  
  // Handle Vietnam phone numbers
  if (countryCode === '+84') {
    // Remove country code if present
    if (digitsOnly.startsWith('84')) {
      digitsOnly = digitsOnly.substring(2);
    }
    
    // Format as 0XX XXX XXXX
    if (digitsOnly.startsWith('0')) {
      if (digitsOnly.length >= 10) {
        return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6, 10)}`;
      }
    } else {
      // Add leading 0
      digitsOnly = '0' + digitsOnly;
      if (digitsOnly.length >= 10) {
        return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6, 10)}`;
      }
    }
  }
  
  return phone; // Return original if can't format
};
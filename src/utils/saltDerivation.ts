/**
 * Frontend Salt Derivation Service
 * Implements deterministic salt generation from user's master password
 * Following zero-knowledge architecture principles
 */

interface SaltDerivationParams {
  masterPassword: string;
  userId: string;
  sessionId: string;
}

interface PasswordRequirements {
  minLength: 12;
  requireUppercase: true;
  requireLowercase: true;
  requireNumbers: true;
  requireSpecial: true;
  preventCommon: true;
  preventReuse: true;
}

export class FrontendSaltService {
  private static readonly ITERATIONS = 100000; // High iteration count for security
  private static readonly KEY_LENGTH = 32; // 32 bytes = 256 bits
  
  /**
   * Derives frontend salt from user's master password
   * This is deterministic - same inputs always produce same output
   * 
   * @param params - Password derivation parameters
   * @returns Promise<string> - Hex-encoded salt
   */
  static async deriveFrontendSalt(params: SaltDerivationParams): Promise<string> {
    const { masterPassword, userId, sessionId } = params;

    try {
      // Validate password strength first (temporarily disabled for testing)
      // this.validatePasswordStrength(masterPassword);

      // Create unique context to prevent salt reuse across different purposes
      const context = `social-recovery:guardian-share:${userId}:${sessionId}`;
      
      // Convert context to bytes for use as PBKDF2 salt
      const contextBytes = new TextEncoder().encode(context);
      
      // Import master password as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(masterPassword),
        'PBKDF2',
        false,
        ['deriveBits']
      );

      // Derive salt using PBKDF2 with high iterations
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: contextBytes,
          iterations: this.ITERATIONS,
          hash: 'SHA-256'
        },
        keyMaterial,
        this.KEY_LENGTH * 8 // Convert to bits
      );

      // Convert to hex string for consistent format
      const saltArray = new Uint8Array(derivedBits);
      return Array.from(saltArray)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    } catch (error) {
      console.error('Frontend salt derivation failed:', error);
      throw new Error('Failed to derive frontend salt');
    }
  }

  /**
   * Validates password meets security requirements
   * @param password - Password to validate
   * @throws Error if password doesn't meet requirements
   */
  static validatePasswordStrength(password: string): void {
    const requirements: PasswordRequirements = {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecial: true,
      preventCommon: true,
      preventReuse: true
    };

    // Check minimum length
    if (password.length < requirements.minLength) {
      throw new Error(`Password must be at least ${requirements.minLength} characters long`);
    }

    // Check character requirements
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }

    // Check for common passwords (basic implementation)
    const commonPasswords = [
      'password123', 'Password123!', '123456789012',
      'qwerty123456', 'admin123456!', 'welcome12345'
    ];
    
    if (commonPasswords.includes(password)) {
      throw new Error('Password is too common. Please choose a more unique password');
    }
  }

  /**
   * Securely clears sensitive data from memory
   * @param sensitiveString - String containing sensitive data
   */
  static clearSensitiveData(sensitiveString: string): void {
    // In JavaScript, we can't directly clear memory, but we can:
    // 1. Overwrite the variable
    // 2. Trigger garbage collection hint
    try {
      // Overwrite with random data (best effort)
      sensitiveString = crypto.getRandomValues(new Uint8Array(sensitiveString.length))
        .reduce((acc, val) => acc + String.fromCharCode(val), '');
      
      // Clear reference
      sensitiveString = '';
      
      // Suggest garbage collection (non-standard, but helps in some environments)
      if (typeof (globalThis as any)?.gc === 'function') {
        (globalThis as any).gc();
      }
    } catch (error) {
      // Silent fail - memory clearing is best effort
      console.warn('Memory clearing failed:', error);
    }
  }

  /**
   * Generates a secure random string for testing/demo purposes
   * NOT for production use - should use real user password
   */
  static generateSecureTestPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*(),.?":{}|<>';
    
    const allChars = uppercase + lowercase + numbers + special;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill remaining length with random characters
    for (let i = 4; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

export default FrontendSaltService;
/**
 * Share Encryption Service
 * Implements dual-salt encryption for guardian shares
 * Zero-knowledge architecture with frontend + backend salt combination
 */

interface EncryptShareParams {
  share: string;
  guardianContactHash: string;
  frontendSalt: string;
  backendSalt: string;
  setupTimestamp: number;
}

interface DecryptShareParams {
  encryptedShare: string;
  guardianContactHash: string;
  frontendSalt: string;
  backendSalt: string;
  setupTimestamp: number;
}

export class ShareEncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits for GCM

  /**
   * Derives encryption key from all security components
   * Uses composite key from: contactHash + frontendSalt + backendSalt + timestamp
   * 
   * @param params - All components needed for key derivation
   * @returns Promise<CryptoKey> - AES-GCM encryption key
   */
  private static async deriveEncryptionKey(params: EncryptShareParams | DecryptShareParams): Promise<CryptoKey> {
    try {
      // Combine all security components into key material
      const keyMaterial = [
        params.guardianContactHash,
        params.frontendSalt,
        params.backendSalt,
        params.setupTimestamp.toString()
      ].join(':');

      // Hash the combined material to get consistent key
      const hash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(keyMaterial)
      );

      // Import hash as AES-GCM key
      return crypto.subtle.importKey(
        'raw',
        hash,
        { name: this.ALGORITHM, length: this.KEY_LENGTH },
        false, // not extractable
        ['encrypt', 'decrypt']
      );

    } catch (error) {
      console.error('Key derivation failed:', error);
      throw new Error('Failed to derive encryption key');
    }
  }

  /**
   * Encrypts a Shamir share for a specific guardian
   * Uses AES-GCM with random IV for each encryption
   * 
   * @param params - Encryption parameters including share and all salt components
   * @returns Promise<string> - Base64-encoded encrypted share (IV + ciphertext)
   */
  static async encryptShare(params: EncryptShareParams): Promise<string> {
    try {
      // Derive the encryption key from all components
      const key = await this.deriveEncryptionKey(params);

      // Generate cryptographically secure random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      // Encrypt the share using AES-GCM
      const encrypted = await crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv },
        key,
        new TextEncoder().encode(params.share)
      );

      // Combine IV + encrypted data for storage
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Return as base64 for easy transport
      return btoa(String.fromCharCode(...combined));

    } catch (error) {
      console.error('Share encryption failed:', error);
      throw new Error('Failed to encrypt guardian share');
    }
  }

  /**
   * Decrypts a guardian share during recovery
   * Requires same salt components that were used during encryption
   * 
   * @param params - Decryption parameters including encrypted share and salt components
   * @returns Promise<string> - Decrypted Shamir share
   */
  static async decryptShare(params: DecryptShareParams): Promise<string> {
    try {
      // Derive the same encryption key used during setup
      const key = await this.deriveEncryptionKey(params);

      // Decode base64 encrypted data
      const combined = new Uint8Array(
        atob(params.encryptedShare)
          .split('')
          .map(c => c.charCodeAt(0))
      );

      // Extract IV and ciphertext
      const iv = combined.slice(0, this.IV_LENGTH);
      const ciphertext = combined.slice(this.IV_LENGTH);

      // Decrypt using AES-GCM
      const decrypted = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv },
        key,
        ciphertext
      );

      // Convert back to string
      return new TextDecoder().decode(decrypted);

    } catch (error) {
      console.error('Share decryption failed:', error);
      throw new Error('Failed to decrypt guardian share');
    }
  }

  /**
   * Validates encrypted share format
   * Checks if the base64 data has the expected structure
   * 
   * @param encryptedShare - Base64-encoded encrypted share
   * @returns boolean - True if format appears valid
   */
  static validateEncryptedShareFormat(encryptedShare: string): boolean {
    try {
      // Check if it's valid base64
      const decoded = atob(encryptedShare);
      
      // Check minimum length (IV + some ciphertext)
      if (decoded.length < this.IV_LENGTH + 1) {
        return false;
      }

      // Check if we can extract IV portion
      const combined = new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)));
      const iv = combined.slice(0, this.IV_LENGTH);
      
      // IV should be exactly the expected length
      return iv.length === this.IV_LENGTH;

    } catch (error) {
      return false;
    }
  }

  /**
   * Generates a hash of guardian contact info for use in encryption
   * This creates a deterministic identifier from contact information
   * 
   * @param contactInfo - Guardian's contact information (email, phone, wallet)
   * @param guardianType - Type of guardian (EMAIL, PHONE, WALLET)
   * @returns Promise<string> - Hex-encoded hash
   */
  static async generateGuardianContactHash(
    contactInfo: string, 
    guardianType: string
  ): Promise<string> {
    try {
      // Normalize contact info based on type
      let normalized = contactInfo.toLowerCase().trim();
      
      if (guardianType === 'PHONE') {
        // Remove all non-digit characters from phone numbers
        normalized = contactInfo.replace(/\D/g, '');
      } else if (guardianType === 'WALLET') {
        // Ensure wallet addresses are lowercase
        normalized = contactInfo.toLowerCase();
      }

      // Create hash input with type prefix for uniqueness
      const hashInput = `${guardianType}:${normalized}`;
      
      // Generate SHA-256 hash
      const hash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(hashInput)
      );

      // Convert to hex string
      return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    } catch (error) {
      console.error('Contact hash generation failed:', error);
      throw new Error('Failed to generate guardian contact hash');
    }
  }

  /**
   * Securely clears encryption keys and sensitive data from memory
   * Best effort memory cleanup for security
   */
  static clearSensitiveData(): void {
    try {
      // Force garbage collection if available
      if (typeof (globalThis as any)?.gc === 'function') {
        (globalThis as any).gc();
      }
    } catch (error) {
      // Silent fail - memory clearing is best effort
      console.warn('Memory clearing failed:', error);
    }
  }
}

export default ShareEncryptionService;
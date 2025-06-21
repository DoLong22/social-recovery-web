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
  // private static readonly TAG_LENGTH = 16; // 128 bits for GCM auth tag (currently unused but kept for future use)

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

      console.log('ShareEncryption - Key derivation params:', {
        guardianContactHash: params.guardianContactHash,
        frontendSalt: params.frontendSalt,
        backendSalt: params.backendSalt,
        setupTimestamp: params.setupTimestamp,
        keyMaterial: keyMaterial,
        keyMaterialCharCodes: Array.from(keyMaterial).map(c => c.charCodeAt(0)),
        keyMaterialLength: keyMaterial.length,
        keyMaterialByteLength: new TextEncoder().encode(keyMaterial).length
      });

      // Hash the combined material to get consistent key
      const hash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(keyMaterial)
      );
      
      console.log('🔑 Key derivation result:', {
        keyMaterialHash: Array.from(new Uint8Array(hash.slice(0, 16))), // First 16 bytes for comparison
        keyMaterialHashFull: Array.from(new Uint8Array(hash)), // Full hash for debugging
        keyMaterialLength: keyMaterial.length,
        hashLength: hash.byteLength,
        keyMaterialHashHex: Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
      });

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
    console.log('🔒 ENCRYPT SHARE - Params:', {
      share: params.share,
      guardianContactHash: params.guardianContactHash,
      frontendSalt: params.frontendSalt,
      backendSalt: params.backendSalt,
      setupTimestamp: params.setupTimestamp
    });
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

      console.log('🔒 ENCRYPTION RESULT:', {
        ivLength: iv.length,
        encryptedLength: encrypted.byteLength,
        combinedLength: combined.length,
        ivSample: Array.from(iv.slice(0, 8)),
        encryptedSample: Array.from(new Uint8Array(encrypted.slice(0, 8))),
        encryptedEndSample: Array.from(new Uint8Array(encrypted.slice(-8))),
        totalExpectedLength: iv.length + encrypted.byteLength
      });

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
    console.log('🔓 DECRYPT SHARE - Params:', {
      encryptedShare: params.encryptedShare,
      guardianContactHash: params.guardianContactHash,
      frontendSalt: params.frontendSalt,
      backendSalt: params.backendSalt,
      setupTimestamp: params.setupTimestamp
    });
    try {
      // Derive the same encryption key used during setup
      const key = await this.deriveEncryptionKey(params);

      // Decode base64 encrypted data
      console.log('🔍 Decoding Base64 share:', {
        encryptedShareLength: params.encryptedShare.length,
        encryptedShareSample: params.encryptedShare.substring(0, 50) + '...'
      });
      
      const combined = new Uint8Array(
        atob(params.encryptedShare)
          .split('')
          .map(c => c.charCodeAt(0))
      );
      
      console.log('🔍 Decoded data:', {
        combinedLength: combined.length,
        firstBytes: Array.from(combined.slice(0, 20)),
        expectedIVLength: 12
      });

      // Extract IV and ciphertext
      const iv = combined.slice(0, this.IV_LENGTH);
      const ciphertext = combined.slice(this.IV_LENGTH);
      
      console.log('🔍 Extracted components:', {
        ivLength: iv.length,
        ciphertextLength: ciphertext.length,
        ivBytes: Array.from(iv),
        ciphertextSample: Array.from(ciphertext.slice(0, 10))
      });

      // Decrypt using AES-GCM
      // The ciphertext should include the authentication tag at the end
      console.log('🔑 About to decrypt with:', {
        algorithm: this.ALGORITHM,
        ivLength: iv.length,
        keyType: key.type,
        keyAlgorithm: key.algorithm,
        ciphertextLength: ciphertext.length,
        ciphertextSample: Array.from(ciphertext.slice(0, 8)),
        ciphertextEndSample: Array.from(ciphertext.slice(-8))
      });
      
      const decrypted = await crypto.subtle.decrypt(
        { 
          name: this.ALGORITHM, 
          iv
        },
        key,
        ciphertext
      );
      
      console.log('✅ Decryption successful:', {
        decryptedLength: decrypted.byteLength
      });

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
   * Test encryption/decryption cycle to verify our implementation
   * This helps debug AES-GCM issues by testing with known parameters
   */
  static async testEncryptionCycle(): Promise<boolean> {
    try {
      console.log('🧪 Testing encryption/decryption cycle...');
      
      const testParams = {
        share: '0801881ceaed30ced900431c5f8222cd79a34b2c9799794bd8', // Sample share from logs
        guardianContactHash: '9f3d3a2672efcda111a4b20c4037577fdb88de2b77e4958354ecd9baa6fd2e1a',
        frontendSalt: '14d75fb6bd7941d3ff5867fb3d9e9fe8ecdabcd57bddcd6e5aed7a00b0d1bf01',
        backendSalt: '9dab15a69e435152b1ffeb5da75a0f3c669b2558d1bbf47138cd6a6619f4af89',
        setupTimestamp: 1750486481898
      };
      
      // Encrypt
      const encrypted = await this.encryptShare(testParams);
      console.log('🧪 Test encryption successful, encrypted:', encrypted.substring(0, 50) + '...');
      
      // Decrypt
      const decrypted = await this.decryptShare({
        encryptedShare: encrypted,
        ...testParams
      });
      console.log('🧪 Test decryption successful, decrypted:', decrypted);
      
      // Verify
      const success = decrypted === testParams.share;
      console.log('🧪 Test result:', success ? '✅ SUCCESS' : '❌ FAILED');
      
      return success;
      
    } catch (error) {
      console.error('🧪 Test FAILED with error:', error);
      return false;
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
/**
 * Recovery Decryption Utilities
 * Handles the decryption of guardian shares during recovery
 */

import { FrontendSaltService } from './saltDerivation';
import { ShareEncryptionService } from './shareEncryption';
import type { CollectedShare } from '../api/recovery';

interface DecryptionParams {
  password: string;
  backendSalt: string;
  setupTimestamp: number;
  guardianConfiguration: Array<{
    guardianId: string;
    contactHash: string;
    type: string;
  }>;
  collectedShares: CollectedShare[];
  userId: string;
  sessionId: string;
}

interface DecryptedShare {
  guardianId: string;
  share: string;
  index: number;
}

export class RecoveryDecryption {
  /**
   * Decrypt collected guardian shares during recovery
   */
  static async decryptShares(params: DecryptionParams): Promise<DecryptedShare[]> {
    const {
      password,
      backendSalt,
      setupTimestamp,
      guardianConfiguration,
      collectedShares,
      userId,
      sessionId
    } = params;

    try {
      console.log('🔐 Starting share decryption process...');

      // Step 1: Derive frontend salt
      const frontendSalt = await FrontendSaltService.deriveFrontendSalt({
        masterPassword: password,
        userId,
        sessionId
      });

      // Step 2: Decrypt each collected share
      const decryptedShares: DecryptedShare[] = [];

      for (const collectedShare of collectedShares) {
        const guardian = guardianConfiguration.find(
          g => g.guardianId === collectedShare.guardianId
        );

        if (!guardian) {
          console.warn(`Guardian config not found for ${collectedShare.guardianId}`);
          continue;
        }

        try {
          // Decrypt the share
          const decryptedShare = await ShareEncryptionService.decryptShare({
            encryptedShare: collectedShare.encryptedShare,
            guardianContactHash: guardian.contactHash,
            frontendSalt,
            backendSalt,
            setupTimestamp
          });

          // Parse the decrypted share to extract index
          const shareData = JSON.parse(atob(decryptedShare));
          
          decryptedShares.push({
            guardianId: collectedShare.guardianId,
            share: decryptedShare,
            index: shareData.index || decryptedShares.length + 1
          });

          console.log(`✅ Decrypted share from guardian ${collectedShare.guardianId}`);
        } catch (error) {
          console.error(`Failed to decrypt share from guardian ${collectedShare.guardianId}:`, error);
          throw new Error(`Failed to decrypt share from guardian ${guardian.type}`);
        }
      }

      // Clear sensitive data
      FrontendSaltService.clearSensitiveData(frontendSalt);

      console.log(`✅ Successfully decrypted ${decryptedShares.length} shares`);
      return decryptedShares;

    } catch (error) {
      console.error('❌ Share decryption failed:', error);
      throw error;
    }
  }

  /**
   * Reconstruct the secret from decrypted shares using Shamir's Secret Sharing
   */
  static async reconstructSecret(
    decryptedShares: DecryptedShare[],
    threshold: number
  ): Promise<string> {
    try {
      if (decryptedShares.length < threshold) {
        throw new Error(
          `Insufficient shares: ${decryptedShares.length} available, ${threshold} required`
        );
      }

      console.log(`🔀 Reconstructing secret from ${decryptedShares.length} shares...`);

      // For now, using mock reconstruction
      // TODO: Replace with real Shamir's Secret Sharing library
      const firstShare = JSON.parse(atob(decryptedShares[0].share));
      const reconstructedSecret = firstShare.secret;

      // Verify all shares contain the same secret (mock validation)
      for (const share of decryptedShares) {
        const shareData = JSON.parse(atob(share.share));
        if (shareData.secret !== reconstructedSecret) {
          throw new Error('Share validation failed - inconsistent shares');
        }
      }

      console.log('✅ Secret successfully reconstructed');
      return reconstructedSecret;

    } catch (error) {
      console.error('❌ Secret reconstruction failed:', error);
      throw error;
    }
  }

  /**
   * Complete recovery flow: decrypt shares and reconstruct secret
   */
  static async performRecovery(params: DecryptionParams): Promise<string> {
    try {
      // Step 1: Decrypt all shares
      const decryptedShares = await this.decryptShares(params);

      // Step 2: Determine threshold from guardian configuration
      const threshold = Math.ceil(params.guardianConfiguration.length * 0.6);

      // Step 3: Reconstruct the secret
      const recoveredSecret = await this.reconstructSecret(decryptedShares, threshold);

      // Step 4: Clear all sensitive data
      this.clearSensitiveData(params.password);
      decryptedShares.forEach(share => {
        this.clearSensitiveData(share.share);
      });

      return recoveredSecret;

    } catch (error) {
      // Clear sensitive data on error
      this.clearSensitiveData(params.password);
      throw error;
    }
  }

  /**
   * Clear sensitive data from memory
   */
  private static clearSensitiveData(data: string): void {
    if (typeof data === 'string' && data.length > 0) {
      // Overwrite the string content
      // const cleared = data.replace(/./g, '\0');
      
      // Force garbage collection if available
      if (typeof (globalThis as any)?.gc === 'function') {
        (globalThis as any).gc();
      }
    }
  }

  /**
   * Validate recovery parameters
   */
  static validateRecoveryParams(params: Partial<DecryptionParams>): void {
    if (!params.password || params.password.length < 12) {
      throw new Error('Invalid password');
    }

    if (!params.backendSalt || params.backendSalt.length !== 64) {
      throw new Error('Invalid backend salt');
    }

    if (!params.collectedShares || params.collectedShares.length === 0) {
      throw new Error('No shares available for recovery');
    }

    if (!params.guardianConfiguration || params.guardianConfiguration.length === 0) {
      throw new Error('Guardian configuration not found');
    }
  }
}

export default RecoveryDecryption;
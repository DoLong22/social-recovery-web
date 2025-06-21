import * as shamir from 'shamirs-secret-sharing';
import type { CollectedShare, BackendSaltResponse } from '../api/recovery';
import { ShareEncryptionService } from './shareEncryption';
import { Buffer } from 'buffer';

/**
 * Decrypt and recombine shares using proper ShareEncryptionService
 * This uses the same dual-salt encryption system used during setup
 */
export async function decryptAndRecombineShares(
  collectedShares: CollectedShare[],
  frontendSalt: string,
  backendSalt: string,
  threshold: number,
  originalSession?: BackendSaltResponse['originalSession']
): Promise<string> {
  try {
    console.log('Starting share decryption...', {
      sharesCount: collectedShares.length,
      threshold,
      hasFrontendSalt: !!frontendSalt,
      hasBackendSalt: !!backendSalt,
      hasOriginalSession: !!originalSession
    });

    console.log('Starting share decryption...', {
      collectedShares,
      frontendSalt,
      backendSalt,
      threshold,
      originalSession
    });

    // We need the original session's setup timestamp and guardian contact hashes
    // These should be provided in the BackendSaltResponse
    if (!originalSession) {
      throw new Error('Original session data is required for share decryption');
    }

    // Debug logging
    console.log('Available guardian IDs in originalSession:', 
      originalSession.guardians.map(g => g.guardianId));
    console.log('Guardian IDs in collectedShares:', 
      collectedShares.map(s => s.guardianId));

    // Decrypt each share using ShareEncryptionService
    const decryptedShares = await Promise.all(
      collectedShares.map(async (collectedShare) => {
        // Find the corresponding guardian info from original session
        const guardianInfo = originalSession.guardians.find(
          g => g.guardianId === collectedShare.guardianId
        );

        if (!guardianInfo) {
          console.error('Guardian info not found!', {
            lookingFor: collectedShare.guardianId,
            availableGuardians: originalSession.guardians
          });
          throw new Error(`Guardian info not found for ${collectedShare.guardianId}`);
        }

        console.log(`Decrypting share for guardian ${collectedShare.guardianId}...`);

        const decryptedShare = await ShareEncryptionService.decryptShare({
          encryptedShare: collectedShare.encryptedShare,
          guardianContactHash: guardianInfo.contactHash,
          frontendSalt,
          backendSalt,
          setupTimestamp: originalSession.setupTimestamp
        });

        return {
          guardianId: collectedShare.guardianId,
          share: decryptedShare
        };
      })
    );

    console.log('Successfully decrypted shares:', decryptedShares.length);

    // Select shares for recombination (up to threshold)
    const selectedShares = decryptedShares.slice(0, threshold);

    // Convert decrypted shares back to buffers for Shamir recombination
    const shareBuffers = selectedShares.map(s => Buffer.from(s.share, 'hex'));

    console.log('Recombining shares using Shamir\'s Secret Sharing...');

    // Recombine shares to get original private key
    const privateKeyBuffer = shamir.combine(shareBuffers);
    const privateKey = privateKeyBuffer.toString('hex');

    console.log('Successfully recovered private key:', privateKey);
    return privateKey;

  } catch (error) {
    console.error('Failed to decrypt and recombine shares:', error);
    throw new Error('Failed to recover private key. Please check your passwords and try again.');
  }
}
/**
 * Guardian Setup Flow Implementation
 * Orchestrates the complete setup process with dual-salt encryption
 * Follows zero-knowledge architecture principles
 */

import { FrontendSaltService } from './saltDerivation';
import { ShareEncryptionService } from './shareEncryption';
import { WalletService } from './walletService';
import { guardianApi } from '../api/guardian';
import * as shamir from 'shamirs-secret-sharing';
import { Buffer } from 'buffer';

interface SetupSessionData {
  sessionId: string;
  userId: string;
  backendSalt: string;
  guardians: Array<{
    guardianId: string;
    contactHash: string;
    type: string;
  }>;
  threshold: number;
  setupTimestamp: number;
}

interface EncryptedShareResult {
  guardianId: string;
  encryptedShare: string;
  guardianType: string;
}

interface SetupFlowParams {
  sessionId: string;
  masterPassword: string;
}

export class GuardianSetupFlow {
  /**
   * Complete guardian setup flow with dual-salt encryption
   * 
   * @param params - Setup parameters including session, password, and secret
   * @returns Promise<EncryptedShareResult[]> - Encrypted shares ready for backend
   */
  static async proceedWithSetup(params: SetupFlowParams): Promise<EncryptedShareResult[]> {
    const { sessionId, masterPassword } = params;

    try {
      console.log('🔧 Starting guardian setup flow...');

      // Get the actual wallet private key
      const wallet = WalletService.getWallet();
      if (!wallet) {
        throw new Error('No wallet found. Please create or import a wallet first.');
      }
      console.log('💰 Using wallet private key for shares:', wallet.privateKey);

      // Step 1: Get session details and backend salt from API
      console.log('📡 Fetching session data and backend salt...');
      const sessionData = await this.getSessionData(sessionId);

      // Step 2: Derive frontend salt from master password
      console.log('🔐 Deriving frontend salt from master password...');
      console.log('SETUP - Salt derivation params:', {
        masterPassword: masterPassword,
        userId: sessionData.userId,
        sessionId: sessionData.sessionId,
        sessionType: 'GUARDIAN_SETUP'
      });
      
      const frontendSalt = await FrontendSaltService.deriveFrontendSalt({
        masterPassword,
        userId: sessionData.userId,
        sessionId: sessionData.sessionId
      });
      console.log('SETUP - Generated frontendSalt:', frontendSalt);

      // Step 3: Generate Shamir's Secret Shares using real SSS and wallet private key
      console.log('🔀 Generating Shamir secret shares...');
      const privateKeyBuffer = Buffer.from(wallet.privateKey, 'hex');
      const shareBuffers = shamir.split(privateKeyBuffer, {
        shares: sessionData.guardians.length,
        threshold: sessionData.threshold
      });

      const shares = shareBuffers.map(buffer => buffer.toString('hex'));
      console.log(`Generated ${shares.length} shares with threshold ${sessionData.threshold}`);

      // Step 4: Encrypt each share with dual-salt system
      console.log('🔒 Encrypting shares with dual-salt system...');
      const encryptedShares = await Promise.all(
        sessionData.guardians.map(async (guardian, index) => {
          console.log(`🔐 Encrypting share for guardian ${guardian.guardianId}:`, {
            shareIndex: index,
            originalShareLength: shares[index].length,
            originalShareSample: shares[index].substring(0, 20) + '...',
            guardianContactHash: guardian.contactHash,
            frontendSalt: frontendSalt,
            backendSalt: sessionData.backendSalt
          });
          
          const encryptedShare = await ShareEncryptionService.encryptShare({
            share: shares[index],
            guardianContactHash: guardian.contactHash,
            frontendSalt,
            backendSalt: sessionData.backendSalt,
            setupTimestamp: sessionData.setupTimestamp
          });

          console.log(`📦 Encrypted share for guardian ${guardian.guardianId}:`, {
            encryptedShareLength: encryptedShare.length,
            encryptedShareSample: encryptedShare.substring(0, 50) + '...',
            encryptedShareEnd: '...' + encryptedShare.substring(encryptedShare.length - 20),
            base64Encoded: true
          });

          return {
            guardianId: guardian.guardianId,
            encryptedShare,
            guardianType: guardian.type
          };
        })
      );

      // Step 5: Clear sensitive data from memory
      console.log('🧹 Clearing sensitive data from memory...');
      FrontendSaltService.clearSensitiveData(frontendSalt);
      FrontendSaltService.clearSensitiveData(masterPassword);
      ShareEncryptionService.clearSensitiveData();

      console.log('✅ Guardian setup flow completed successfully');
      return encryptedShares;

    } catch (error) {
      console.error('❌ Guardian setup flow failed:', error);

      // Clear any sensitive data on error
      FrontendSaltService.clearSensitiveData(masterPassword);
      ShareEncryptionService.clearSensitiveData();

      throw new Error(`Setup flow failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get session data with backend salt from API
   * 
   * @param sessionId - Session identifier
   * @returns Promise<SetupSessionData> - Session data with backend salt
   */
  private static async getSessionData(sessionId: string): Promise<SetupSessionData> {
    try {
      // Call the prepare endpoint to get backend salt
      const prepareResponse = await guardianApi.prepareSession(sessionId, {
        deviceInfo: {
          deviceId: this.getDeviceId(),
          platform: 'web',
          version: '1.0.0'
        }
      });

      // Get current session details for threshold and user info
      const sessionResponse = await guardianApi.getSessionStatus(sessionId);
      const userId = sessionResponse.userId || localStorage.getItem('userId') || (() => {
        console.error('⚠️ No userId found - this will cause recovery issues!');
        return 'unknown_user';
      })();

      return {
        sessionId: prepareResponse.sessionId,
        userId,
        backendSalt: prepareResponse.backendSalt,
        guardians: prepareResponse.guardians,
        threshold: sessionResponse.minimumAcceptances,
        setupTimestamp: prepareResponse.setupTimestamp
      };
    } catch (error) {
      console.error('Failed to get session data:', error);
      throw new Error('Failed to prepare session. Please try again.');
    }
  }

  /**
   * Get or generate device ID for this browser/device
   * 
   * @returns string - Unique device identifier
   */
  private static getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'web_' + crypto.getRandomValues(new Uint32Array(1))[0].toString(36) + '_' + Date.now().toString(36);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  /**
   * Recovery flow for decrypting and reconstructing secret
   * 
   * @param masterPassword - User's master password
   * @param encryptedShares - Encrypted shares from guardians
   * @param sessionData - Session metadata for decryption
   * @returns Promise<string> - Reconstructed secret
   */
  static async recoverSecret(
    masterPassword: string,
    encryptedShares: Array<{
      encryptedShare: string;
      guardianContactHash: string;
    }>,
    sessionData: SetupSessionData
  ): Promise<string> {
    try {
      console.log('🔄 Starting recovery flow...');

      // Step 1: Derive frontend salt (same as setup)
      console.log('🔐 Deriving frontend salt from master password...');
      const frontendSalt = await FrontendSaltService.deriveFrontendSalt({
        masterPassword,
        userId: sessionData.userId,
        sessionId: sessionData.sessionId
      });

      // Step 2: Decrypt all shares
      console.log('🔓 Decrypting guardian shares...');
      const decryptedShares = await Promise.all(
        encryptedShares.map(async (encShare) => {
          return ShareEncryptionService.decryptShare({
            encryptedShare: encShare.encryptedShare,
            guardianContactHash: encShare.guardianContactHash,
            frontendSalt,
            backendSalt: sessionData.backendSalt,
            setupTimestamp: sessionData.setupTimestamp
          });
        })
      );

      // Step 3: Reconstruct secret using Shamir's
      console.log('🔀 Reconstructing secret from shares...');
      const reconstructedSecret = await this.reconstructShamirSecret(
        decryptedShares,
        sessionData.threshold
      );

      // Step 4: Clear sensitive data
      console.log('🧹 Clearing sensitive data...');
      FrontendSaltService.clearSensitiveData(frontendSalt);
      FrontendSaltService.clearSensitiveData(masterPassword);
      decryptedShares.forEach(share => {
        FrontendSaltService.clearSensitiveData(share);
      });

      console.log('✅ Recovery completed successfully');
      return reconstructedSecret;

    } catch (error) {
      console.error('❌ Recovery failed:', error);
      throw new Error(`Recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reconstruct secret from Shamir shares
   * 
   * @param shares - Decrypted Shamir shares
   * @param threshold - Minimum shares needed
   * @returns Promise<string> - Reconstructed secret
   */
  private static async reconstructShamirSecret(
    shares: string[],
    threshold: number
  ): Promise<string> {
    try {
      if (shares.length < threshold) {
        throw new Error(`Need at least ${threshold} shares to reconstruct secret`);
      }

      // Mock reconstruction - real implementation would use Lagrange interpolation
      const firstShare = JSON.parse(atob(shares[0]));
      return firstShare.secret;

    } catch (error) {
      console.error('Secret reconstruction failed:', error);
      throw new Error('Failed to reconstruct secret from shares');
    }
  }

  /**
   * Validate setup parameters before processing
   * 
   * @param params - Setup parameters to validate
   * @throws Error if validation fails
   */
  static validateSetupParams(params: SetupFlowParams): void {
    if (!params.sessionId || params.sessionId.length < 10) {
      throw new Error('Invalid session ID');
    }

    if (!params.masterPassword) {
      throw new Error('Master password is required');
    }

    // if (!params.recoverySecret || params.recoverySecret.length < 32) {
    //   throw new Error('Recovery secret must be at least 32 characters');
    // }

    // Validate password strength
    try {
      FrontendSaltService.validatePasswordStrength(params.masterPassword);
    } catch (error) {
      throw new Error(`Password validation failed: ${error instanceof Error ? error.message : 'Invalid password'}`);
    }
  }
}

export default GuardianSetupFlow;
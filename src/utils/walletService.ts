import CryptoJS from 'crypto-js';

interface Wallet {
  privateKey: string;
  address: string;
}

export class WalletService {
  private static readonly STORAGE_KEY = 'social_recovery_wallet';

  /**
   * Generate a new wallet with random private key
   */
  static async generateWallet(): Promise<Wallet> {
    // Generate random 32 bytes for private key
    const privateKeyBytes = new Uint8Array(32);
    crypto.getRandomValues(privateKeyBytes);
    
    // Convert to hex string
    const privateKey = Array.from(privateKeyBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Generate address from private key (mock - in real app would use proper derivation)
    const address = this.deriveAddress(privateKey);
    
    const wallet = { privateKey, address };
    this.saveWallet(wallet);
    
    return wallet;
  }

  /**
   * Import wallet from private key
   */
  static async importWallet(privateKey: string): Promise<Wallet> {
    // Validate private key format (64 hex chars)
    const cleanKey = privateKey.replace(/^0x/, '').toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(cleanKey)) {
      throw new Error('Invalid private key format');
    }
    
    const address = this.deriveAddress(cleanKey);
    const wallet = { privateKey: cleanKey, address };
    this.saveWallet(wallet);
    
    return wallet;
  }

  /**
   * Derive address from private key (mock implementation)
   * In a real app, this would use proper cryptographic derivation
   */
  private static deriveAddress(privateKey: string): string {
    // Mock address derivation using hash of private key
    const hash = CryptoJS.SHA256(privateKey).toString();
    return '0x' + hash.substring(0, 40);
  }

  /**
   * Save wallet to local storage
   */
  private static saveWallet(wallet: Wallet): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(wallet));
  }

  /**
   * Get wallet from local storage
   */
  static getWallet(): Wallet | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Export wallet data
   */
  static exportWallet(): Wallet | null {
    return this.getWallet();
  }

  /**
   * Clear wallet from storage
   */
  static clearWallet(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Check if wallet exists
   */
  static hasWallet(): boolean {
    return !!this.getWallet();
  }
}
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WalletData {
  btcAddress: string;
  lightningAddress: string;
  mnemonic: string;
  privateKey: string;
}

export interface BalanceData {
  btc: number;
  zmw: number;
  [key: string]: number; // Allow dynamic currency balances
}

export class WalletService {
  private static readonly WALLET_KEY = 'voltx_wallet_data';
  private static readonly BALANCE_KEY = 'voltx_balance_data';
  private static readonly SETTINGS_KEY = 'voltx_settings';

  static async initializeWallet(): Promise<WalletData> {
    try {
      // Check if wallet already exists
      const existingWallet = await this.getWallet();
      if (existingWallet) {
        return existingWallet;
      }

      // Generate new wallet (mock implementation)
      const walletData: WalletData = {
        btcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        lightningAddress: 'voltx@yakihonne.network',
        mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        privateKey: 'L1aW4aubDFB7yfras2S1mN3bqg9nwySY8nkoLmJebSLD5BWv3ENZ'
      };

      await this.saveWallet(walletData);
      return walletData;
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      throw error;
    }
  }

  static async getWallet(): Promise<WalletData | null> {
    try {
      const walletData = await AsyncStorage.getItem(this.WALLET_KEY);
      return walletData ? JSON.parse(walletData) : null;
    } catch (error) {
      console.error('Failed to get wallet:', error);
      return null;
    }
  }

  private static async saveWallet(walletData: WalletData): Promise<void> {
    try {
      await AsyncStorage.setItem(this.WALLET_KEY, JSON.stringify(walletData));
    } catch (error) {
      console.error('Failed to save wallet:', error);
      throw error;
    }
  }

  static async getBalances(): Promise<BalanceData> {
    try {
      const balanceData = await AsyncStorage.getItem(this.BALANCE_KEY);
      if (balanceData) {
        return JSON.parse(balanceData);
      }
      
      // Return default balances
      const defaultBalances: BalanceData = { btc: 0.00234567, zmw: 12450.75 };
      await this.saveBalances(defaultBalances);
      return defaultBalances;
    } catch (error) {
      console.error('Failed to get balances:', error);
      return { btc: 0, zmw: 0 };
    }
  }

  static async saveBalances(balances: BalanceData): Promise<void> {
    try {
      await AsyncStorage.setItem(this.BALANCE_KEY, JSON.stringify(balances));
    } catch (error) {
      console.error('Failed to save balances:', error);
      throw error;
    }
  }

  static async updateBalance(currency: 'btc' | 'zmw', amount: number): Promise<void> {
    try {
      const currentBalances = await this.getBalances();
      currentBalances[currency] = amount;
      await this.saveBalances(currentBalances);
    } catch (error) {
      console.error('Failed to update balance:', error);
      throw error;
    }
  }

  static async updateLocalBalance(currency: string, amount: number): Promise<void> {
    try {
      const currentBalances = await this.getBalances();
      // Create a new balance object with the updated currency
      const updatedBalances = {
        ...currentBalances,
        [currency.toLowerCase()]: amount
      };
      await this.saveBalances(updatedBalances);
    } catch (error) {
      console.error(`Failed to update ${currency} balance:`, error);
      throw error;
    }
  }

  static async getStealthMode(): Promise<boolean> {
    try {
      const settings = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (settings) {
        const parsed = JSON.parse(settings);
        return parsed.stealthMode || false;
      }
      return false;
    } catch (error) {
      console.error('Failed to get stealth mode:', error);
      return false;
    }
  }

  static async setStealthMode(enabled: boolean): Promise<void> {
    try {
      const settings = await AsyncStorage.getItem(this.SETTINGS_KEY);
      const parsed = settings ? JSON.parse(settings) : {};
      parsed.stealthMode = enabled;
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(parsed));
    } catch (error) {
      console.error('Failed to set stealth mode:', error);
      throw error;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.WALLET_KEY,
        this.BALANCE_KEY,
        this.SETTINGS_KEY
      ]);
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }

  // Mock Bitcoin transaction methods
  static async generateNewAddress(): Promise<string> {
    // In a real app, this would generate a new Bitcoin address
    const addresses = [
      'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  }

  static async broadcastTransaction(signedTx: string): Promise<string> {
    // Mock transaction broadcast
    return new Promise((resolve) => {
      setTimeout(() => {
        const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        resolve(txId);
      }, 1000);
    });
  }
}
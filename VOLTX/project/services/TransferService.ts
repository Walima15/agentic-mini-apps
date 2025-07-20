export interface BitcoinTransfer {
  id: string;
  type: 'onchain' | 'lightning';
  fromAddress: string;
  toAddress: string;
  amount: number;
  fee: number;
  status: 'pending' | 'broadcasting' | 'confirmed' | 'failed';
  txHash?: string;
  timestamp: number;
  estimatedConfirmationTime?: number;
  actualConfirmationTime?: number;
}

export interface FeeCollection {
  transactionId: string;
  feeAmount: number;
  feeType: 'network' | 'protocol' | 'conversion';
  collectionAddress: string;
  timestamp: number;
  status: 'pending' | 'collected';
}

export class TransferService {
  private static readonly FEE_COLLECTION_ADDRESS = 'bc1pax0kxjzq6wamarvpxgt8unhzqyz0elm8g7frxajg34wIxcpsy5wzen';
  private static readonly PROTOCOL_FEE_RATE = 0.005; // 0.5%
  private static readonly MIN_NETWORK_FEE = 0.00001; // 1000 sats
  private static readonly LIGHTNING_FEE_RATE = 0.001; // 0.1%

  // Bitcoin On-Chain Transfer
  static async sendBitcoinOnChain(
    toAddress: string, 
    amount: number, 
    feeRate: 'slow' | 'normal' | 'fast' = 'normal'
  ): Promise<BitcoinTransfer> {
    try {
      // Calculate network fee based on fee rate
      const networkFee = this.calculateOnChainFee(amount, feeRate);
      const protocolFee = amount * this.PROTOCOL_FEE_RATE;
      const totalFee = networkFee + protocolFee;

      // Validate sufficient balance
      const { WalletService } = await import('./WalletService');
      const balances = await WalletService.getBalances();
      
      if (balances.btc < (amount + totalFee)) {
        throw new Error('Insufficient balance for transfer and fees');
      }

      const wallet = await WalletService.getWallet();
      if (!wallet) {
        throw new Error('Wallet not initialized');
      }

      const transfer: BitcoinTransfer = {
        id: `btc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'onchain',
        fromAddress: wallet.btcAddress,
        toAddress,
        amount,
        fee: totalFee,
        status: 'pending',
        timestamp: Date.now(),
        estimatedConfirmationTime: this.getEstimatedConfirmationTime(feeRate)
      };

      // Process the transfer
      await this.processOnChainTransfer(transfer, protocolFee);
      
      return transfer;
    } catch (error) {
      console.error('On-chain transfer failed:', error);
      throw error;
    }
  }

  // Lightning Network Transfer
  static async sendBitcoinLightning(
    lightningAddress: string, 
    amount: number
  ): Promise<BitcoinTransfer> {
    try {
      // Calculate Lightning fees
      const lightningFee = Math.max(amount * this.LIGHTNING_FEE_RATE, 0.000001); // Min 100 sats
      const protocolFee = amount * this.PROTOCOL_FEE_RATE;
      const totalFee = lightningFee + protocolFee;

      // Validate sufficient balance
      const { WalletService } = await import('./WalletService');
      const balances = await WalletService.getBalances();
      
      if (balances.btc < (amount + totalFee)) {
        throw new Error('Insufficient balance for Lightning transfer and fees');
      }

      const wallet = await WalletService.getWallet();
      if (!wallet) {
        throw new Error('Wallet not initialized');
      }

      const transfer: BitcoinTransfer = {
        id: `ln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'lightning',
        fromAddress: wallet.lightningAddress,
        toAddress: lightningAddress,
        amount,
        fee: totalFee,
        status: 'pending',
        timestamp: Date.now(),
        estimatedConfirmationTime: 5000 // 5 seconds for Lightning
      };

      // Process the Lightning transfer
      await this.processLightningTransfer(transfer, protocolFee);
      
      return transfer;
    } catch (error) {
      console.error('Lightning transfer failed:', error);
      throw error;
    }
  }

  private static async processOnChainTransfer(
    transfer: BitcoinTransfer, 
    protocolFee: number
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        transfer.status = 'broadcasting';
        
        // Simulate transaction broadcasting
        setTimeout(async () => {
          try {
            // Generate mock transaction hash
            transfer.txHash = `${Math.random().toString(16).substr(2, 64)}`;
            
            // Collect fees automatically
            await this.collectTransactionFees(transfer.id, protocolFee, 'protocol');
            
            // Update wallet balance
            const { WalletService } = await import('./WalletService');
            const currentBalances = await WalletService.getBalances();
            await WalletService.updateBalance('btc', currentBalances.btc - (transfer.amount + transfer.fee));
            
            transfer.status = 'confirmed';
            transfer.actualConfirmationTime = Date.now() - transfer.timestamp;
            
            // Save transfer to history
            await this.saveTransferToHistory(transfer);
            
            resolve();
          } catch (error) {
            transfer.status = 'failed';
            reject(error);
          }
        }, 2000);
      } catch (error) {
        transfer.status = 'failed';
        reject(error);
      }
    });
  }

  private static async processLightningTransfer(
    transfer: BitcoinTransfer, 
    protocolFee: number
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        transfer.status = 'broadcasting';
        
        // Simulate Lightning payment
        setTimeout(async () => {
          try {
            // Generate mock payment hash
            transfer.txHash = `ln_${Math.random().toString(16).substr(2, 64)}`;
            
            // Collect fees automatically
            await this.collectTransactionFees(transfer.id, protocolFee, 'protocol');
            
            // Update wallet balance
            const { WalletService } = await import('./WalletService');
            const currentBalances = await WalletService.getBalances();
            await WalletService.updateBalance('btc', currentBalances.btc - (transfer.amount + transfer.fee));
            
            transfer.status = 'confirmed';
            transfer.actualConfirmationTime = Date.now() - transfer.timestamp;
            
            // Save transfer to history
            await this.saveTransferToHistory(transfer);
            
            resolve();
          } catch (error) {
            transfer.status = 'failed';
            reject(error);
          }
        }, 1000); // Lightning is faster
      } catch (error) {
        transfer.status = 'failed';
        reject(error);
      }
    });
  }

  // Automatic Fee Collection
  private static async collectTransactionFees(
    transactionId: string,
    feeAmount: number,
    feeType: 'network' | 'protocol' | 'conversion'
  ): Promise<void> {
    try {
      const feeCollection: FeeCollection = {
        transactionId,
        feeAmount,
        feeType,
        collectionAddress: this.FEE_COLLECTION_ADDRESS,
        timestamp: Date.now(),
        status: 'pending'
      };

      // In a real app, this would create an actual Bitcoin transaction to the collection address
      // For now, we'll simulate the fee collection
      setTimeout(async () => {
        feeCollection.status = 'collected';
        await this.saveFeeCollection(feeCollection);
        console.log(`Fee collected: ${feeAmount} BTC to ${this.FEE_COLLECTION_ADDRESS}`);
      }, 500);

    } catch (error) {
      console.error('Fee collection failed:', error);
      // Don't throw error here to avoid breaking the main transaction
    }
  }

  private static calculateOnChainFee(amount: number, feeRate: 'slow' | 'normal' | 'fast'): number {
    const baseFee = this.MIN_NETWORK_FEE;
    const multiplier = {
      slow: 1,
      normal: 1.5,
      fast: 2.5
    };
    
    return Math.max(baseFee * multiplier[feeRate], this.MIN_NETWORK_FEE);
  }

  private static getEstimatedConfirmationTime(feeRate: 'slow' | 'normal' | 'fast'): number {
    const times = {
      slow: 3600000,    // 1 hour
      normal: 1800000,  // 30 minutes
      fast: 600000      // 10 minutes
    };
    
    return times[feeRate];
  }

  private static async saveTransferToHistory(transfer: BitcoinTransfer): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const history = await AsyncStorage.getItem('bitcoin_transfer_history');
      const transfers = history ? JSON.parse(history) : [];
      
      transfers.unshift(transfer);
      
      // Keep only last 100 transfers
      const trimmedHistory = transfers.slice(0, 100);
      
      await AsyncStorage.setItem('bitcoin_transfer_history', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Failed to save transfer to history:', error);
    }
  }

  private static async saveFeeCollection(feeCollection: FeeCollection): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const history = await AsyncStorage.getItem('fee_collection_history');
      const collections = history ? JSON.parse(history) : [];
      
      collections.unshift(feeCollection);
      
      // Keep only last 200 fee collections
      const trimmedHistory = collections.slice(0, 200);
      
      await AsyncStorage.setItem('fee_collection_history', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Failed to save fee collection:', error);
    }
  }

  static async getTransferHistory(): Promise<BitcoinTransfer[]> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const history = await AsyncStorage.getItem('bitcoin_transfer_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get transfer history:', error);
      return [];
    }
  }

  static async getFeeCollectionHistory(): Promise<FeeCollection[]> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const history = await AsyncStorage.getItem('fee_collection_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get fee collection history:', error);
      return [];
    }
  }

  static getFeeCollectionAddress(): string {
    return this.FEE_COLLECTION_ADDRESS;
  }

  // Validate Bitcoin addresses
  static validateBitcoinAddress(address: string): boolean {
    // Basic Bitcoin address validation (simplified)
    const patterns = [
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Legacy P2PKH and P2SH
      /^bc1[a-z0-9]{39,59}$/,              // Bech32 (native SegWit)
      /^bc1p[a-z0-9]{58}$/                 // Bech32m (Taproot)
    ];
    
    return patterns.some(pattern => pattern.test(address));
  }

  // Validate Lightning addresses
  static validateLightningAddress(address: string): boolean {
    // Lightning address format: user@domain.com or LNURL
    const lightningPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const lnurlPattern = /^lnurl[a-z0-9]+$/i;
    
    return lightningPattern.test(address) || lnurlPattern.test(address);
  }

  // Get current network fees
  static async getCurrentNetworkFees(): Promise<{slow: number, normal: number, fast: number}> {
    // In a real app, this would fetch from a Bitcoin fee estimation API
    return {
      slow: 0.00001,
      normal: 0.000015,
      fast: 0.000025
    };
  }
}
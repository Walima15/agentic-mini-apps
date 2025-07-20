import { WalletService } from './WalletService';

export interface Country {
  id: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  exchangeRate: number; // Rate from USD
}

export const SOUTHERN_AFRICAN_COUNTRIES: Country[] = [
  {
    id: 'zm',
    name: 'Zambia',
    currency: 'ZMW',
    currencySymbol: 'K',
    flag: '🇿🇲',
    exchangeRate: 18.5
  },
  {
    id: 'za',
    name: 'South Africa',
    currency: 'ZAR',
    currencySymbol: 'R',
    flag: '🇿🇦',
    exchangeRate: 18.2
  },
  {
    id: 'bw',
    name: 'Botswana',
    currency: 'BWP',
    currencySymbol: 'P',
    flag: '🇧🇼',
    exchangeRate: 13.4
  },
  {
    id: 'na',
    name: 'Namibia',
    currency: 'NAD',
    currencySymbol: 'N$',
    flag: '🇳🇦',
    exchangeRate: 18.2
  },
  {
    id: 'sz',
    name: 'Eswatini',
    currency: 'SZL',
    currencySymbol: 'E',
    flag: '🇸🇿',
    exchangeRate: 18.2
  },
  {
    id: 'ls',
    name: 'Lesotho',
    currency: 'LSL',
    currencySymbol: 'L',
    flag: '🇱🇸',
    exchangeRate: 18.2
  },
  {
    id: 'mw',
    name: 'Malawi',
    currency: 'MWK',
    currencySymbol: 'MK',
    flag: '🇲🇼',
    exchangeRate: 1020
  },
  {
    id: 'mz',
    name: 'Mozambique',
    currency: 'MZN',
    currencySymbol: 'MT',
    flag: '🇲🇿',
    exchangeRate: 63.8
  }
];

export interface ConversionRate {
  btcToUsd: number;
  usdToLocal: number;
  btcToLocal: number;
  timestamp: number;
  country: Country;
}

export interface ConversionOrder {
  id: string;
  fromAmount: number;
  fromCurrency: 'BTC' | 'USDT' | 'USDC';
  toAmount: number;
  toCurrency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  route: string[];
  estimatedTime: number;
  actualTime?: number;
  fees: {
    network: number;
    protocol: number;
    total: number;
  };
  yakihonneOrderId: string;
  timestamp: number;
  country: Country;
}

export class ConversionService {
  private static readonly RATE_CACHE_KEY = 'conversion_rates';
  private static readonly CACHE_DURATION = 60000; // 1 minute
  private static readonly COLLECTION_ADDRESS = 'bc1pax0kxjzq6wamarvpxgt8unhzqyz0elm8g7frxajg34wIxcpsy5wzen';

  static async getBTCtoLocalRate(country: Country): Promise<number> {
    try {
      const rates = await this.getExchangeRates(country);
      return rates.btcToLocal;
    } catch (error) {
      console.error(`Failed to get BTC to ${country.currency} rate:`, error);
      // Return fallback rate
      return 45000 * country.exchangeRate;
    }
  }

  static async getExchangeRates(country: Country): Promise<ConversionRate> {
    try {
      // Check cache first
      const cachedRates = await this.getCachedRates(country.id);
      if (cachedRates && (Date.now() - cachedRates.timestamp) < this.CACHE_DURATION) {
        return cachedRates;
      }

      // Fetch new rates (mock implementation)
      const rates: ConversionRate = {
        btcToUsd: 45000,
        usdToLocal: country.exchangeRate,
        btcToLocal: 45000 * country.exchangeRate,
        timestamp: Date.now(),
        country
      };

      await this.cacheRates(rates, country.id);
      return rates;
    } catch (error) {
      console.error('Failed to get exchange rates:', error);
      throw error;
    }
  }

  private static async getCachedRates(countryId: string): Promise<ConversionRate | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const cached = await AsyncStorage.getItem(`${this.RATE_CACHE_KEY}_${countryId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      return null;
    }
  }

  private static async cacheRates(rates: ConversionRate, countryId: string): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(`${this.RATE_CACHE_KEY}_${countryId}`, JSON.stringify(rates));
    } catch (error) {
      console.error('Failed to cache rates:', error);
    }
  }

  static async convertBTCtoLocal(btcAmount: number, country: Country): Promise<ConversionOrder> {
    try {
      const rates = await this.getExchangeRates(country);
      const localAmount = btcAmount * rates.btcToLocal;
      
      // Calculate fees
      const networkFee = 0.00001; // 1000 sats
      const protocolFee = localAmount * 0.005; // 0.5%
      const totalFee = networkFee + (protocolFee / rates.btcToLocal);

      const order: ConversionOrder = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromAmount: btcAmount,
        fromCurrency: 'BTC',
        toAmount: localAmount,
        toCurrency: country.currency,
        status: 'pending',
        route: ['BTC', 'USDT', country.currency],
        estimatedTime: 180000, // 3 minutes
        fees: {
          network: networkFee,
          protocol: protocolFee,
          total: totalFee
        },
        yakihonneOrderId: `yaki_${Date.now()}`,
        timestamp: Date.now(),
        country
      };

      // Process the conversion (mock implementation)
      await this.processConversion(order);
      
      return order;
    } catch (error) {
      console.error(`Failed to convert BTC to ${country.currency}:`, error);
      throw error;
    }
  }

  private static async processConversion(order: ConversionOrder): Promise<void> {
    // Mock conversion process
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Update order status
          order.status = 'processing';
          
          // Simulate Yokihonne protocol interaction
          await this.interactWithYakiHonne(order);
          
          // Automatically collect protocol fees
          await this.collectConversionFees(order);
          
          // Update balances
          const currentBalances = await WalletService.getBalances();
          await WalletService.saveBalances({
            btc: currentBalances.btc - order.fromAmount,
            zmw: order.country.id === 'zm' ? currentBalances.zmw + order.toAmount : currentBalances.zmw
          });
          
          order.status = 'completed';
          order.actualTime = Date.now() - order.timestamp;
          
          resolve();
        } catch (error) {
          order.status = 'failed';
          reject(error);
        }
      }, 2000);
    });
  }

  private static async collectConversionFees(order: ConversionOrder): Promise<void> {
    try {
      const { TransferService } = await import('./TransferService');
      
      // Create fee collection record
      const feeCollection = {
        transactionId: order.id,
        feeAmount: order.fees.protocol,
        feeType: 'conversion' as const,
        collectionAddress: TransferService.getFeeCollectionAddress(),
        timestamp: Date.now(),
        status: 'collected' as const
      };

      // Save fee collection to history
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const history = await AsyncStorage.getItem('fee_collection_history');
      const collections = history ? JSON.parse(history) : [];
      collections.unshift(feeCollection);
      await AsyncStorage.setItem('fee_collection_history', JSON.stringify(collections.slice(0, 200)));
      
      console.log(`Conversion fee collected: ${order.fees.protocol} BTC to ${feeCollection.collectionAddress}`);
    } catch (error) {
      console.error('Failed to collect conversion fees:', error);
    }
  }

  private static async interactWithYakiHonne(order: ConversionOrder): Promise<void> {
    // Mock YakiHonne decentralized network interaction
    // In a real app, this would:
    // 1. Submit order to YakiHonne decentralized network
    // 2. Wait for peer-to-peer matching
    // 3. Execute trustless atomic swap
    // 4. Confirm decentralized settlement
    
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`YakiHonne decentralized order ${order.yakihonneOrderId} processed`);
        resolve();
      }, 1000);
    });
  }

  static async getMaxConvertibleAmount(): Promise<number> {
    try {
      const balances = await WalletService.getBalances();
      // Reserve some BTC for fees
      return Math.max(0, balances.btc - 0.0001);
    } catch (error) {
      console.error('Failed to get max convertible amount:', error);
      return 0;
    }
  }

  static async getConversionHistory(): Promise<ConversionOrder[]> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const history = await AsyncStorage.getItem('conversion_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get conversion history:', error);
      return [];
    }
  }

  static async saveConversionOrder(order: ConversionOrder): Promise<void> {
    try {
      const history = await this.getConversionHistory();
      history.unshift(order);
      
      // Keep only last 100 orders
      const trimmedHistory = history.slice(0, 100);
      
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('conversion_history', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Failed to save conversion order:', error);
    }
  }

  // Auto-convert functionality
  static async enableAutoConvert(threshold: number = 0.001): Promise<void> {
    // In a real app, this would set up decentralized monitoring for incoming transactions
    // and automatically trigger peer-to-peer conversions when balance exceeds threshold
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('auto_convert_settings', JSON.stringify({
        enabled: true,
        threshold,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to enable auto-convert:', error);
      throw error;
    }
  }

  static async disableAutoConvert(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('auto_convert_settings');
    } catch (error) {
      console.error('Failed to disable auto-convert:', error);
      throw error;
    }
  }

  static getCollectionAddress(): string {
    return this.COLLECTION_ADDRESS;
  }

  static getCountryById(countryId: string): Country | undefined {
    return SOUTHERN_AFRICAN_COUNTRIES.find(country => country.id === countryId);
  }

  static async getSelectedCountry(): Promise<Country> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const saved = await AsyncStorage.getItem('selected_country');
      return saved ? JSON.parse(saved) : SOUTHERN_AFRICAN_COUNTRIES[0]; // Default to Zambia
    } catch (error) {
      return SOUTHERN_AFRICAN_COUNTRIES[0];
    }
  }

  static async setSelectedCountry(country: Country): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('selected_country', JSON.stringify(country));
    } catch (error) {
      console.error('Failed to save selected country:', error);
    }
  }
}
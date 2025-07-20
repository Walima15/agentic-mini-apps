import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export class SecurityService {
  static async authenticate(): Promise<boolean> {
    try {
      // Check if device supports biometric authentication
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fallback to PIN/password authentication
        return this.fallbackAuthentication();
      }

      // Use biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your wallet',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  private static async fallbackAuthentication(): Promise<boolean> {
    // In a real app, this would show a PIN entry screen
    // For demo purposes, we'll return true
    return true;
  }

  static async encryptData(data: string, key: string): Promise<string> {
    // In a real app, this would use proper encryption
    // For demo purposes, we'll just return the data
    return Buffer.from(data).toString('base64');
  }

  static async decryptData(encryptedData: string, key: string): Promise<string> {
    // In a real app, this would use proper decryption
    // For demo purposes, we'll just decode the base64
    return Buffer.from(encryptedData, 'base64').toString('utf8');
  }

  static async generateSecureKey(): Promise<string> {
    // In a real app, this would generate a cryptographically secure key
    return Math.random().toString(36).substring(2, 15);
  }

  static async secureStore(key: string, value: string): Promise<void> {
    // In a real app, this would use expo-secure-store
    // For demo purposes, we'll just use AsyncStorage
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(`secure_${key}`, value);
    } catch (error) {
      console.error('Failed to secure store:', error);
      throw error;
    }
  }

  static async secureRetrieve(key: string): Promise<string | null> {
    // In a real app, this would use expo-secure-store
    // For demo purposes, we'll just use AsyncStorage
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(`secure_${key}`);
    } catch (error) {
      console.error('Failed to secure retrieve:', error);
      return null;
    }
  }

  static async checkDeviceIntegrity(): Promise<boolean> {
    // Check if device is rooted/jailbroken (mock implementation)
    if (Platform.OS === 'android') {
      // In a real app, check for root indicators
      return true;
    } else if (Platform.OS === 'ios') {
      // In a real app, check for jailbreak indicators
      return true;
    }
    return true;
  }
}
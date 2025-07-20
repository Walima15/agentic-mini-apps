import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Download, 
  Trash2, 
  Info, 
  ExternalLink,
  Lock,
  Globe,
  Zap
} from 'lucide-react-native';

export default function SettingsScreen() {
  const [stealthMode, setStealthMode] = useState(false);
  const [autoConvert, setAutoConvert] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real app, these would be loaded from secure storage
      // For now, we'll use these default values
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleStealthModeToggle = async (value: boolean) => {
    setStealthMode(value);
    // Save to secure storage
  };

  const handleAutoConvertToggle = async (value: boolean) => {
    setAutoConvert(value);
    // Save to secure storage and update conversion service
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!value) {
      Alert.alert(
        'Disable Biometric Security',
        'This will make your wallet less secure. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disable', style: 'destructive', onPress: () => setBiometricEnabled(false) }
        ]
      );
    } else {
      setBiometricEnabled(value);
    }
  };

  const exportWallet = () => {
    Alert.alert(
      'Export Wallet',
      'This will show your recovery phrase. Make sure you are in a private location.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Show Recovery Phrase', onPress: () => {
          Alert.alert(
            'Recovery Phrase',
            'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about\n\n⚠️ Never share this phrase with anyone!'
          );
        }}
      ]
    );
  };

  const clearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete your wallet and all transaction history. Make sure you have backed up your recovery phrase.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Everything', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert('Data Cleared', 'All local data has been removed.');
          }
        }
      ]
    );
  };

  const openLink = (url: string) => {
    // In a real app, this would open the URL in a browser
    Alert.alert('External Link', `Would open: ${url}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Fully decentralized Bitcoin wallet configuration
        </Text>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            {stealthMode ? (
              <EyeOff size={20} color="#F97316" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Stealth Mode</Text>
              <Text style={styles.settingDescription}>
                Hide sensitive information in UI
              </Text>
            </View>
          </View>
          <Switch
            value={stealthMode}
            onValueChange={handleStealthModeToggle}
            trackColor={{ false: '#374151', true: '#F97316' }}
            thumbColor={stealthMode ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Lock size={20} color="#10B981" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Biometric Security</Text>
              <Text style={styles.settingDescription}>
                Use fingerprint or face unlock
              </Text>
            </View>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: '#374151', true: '#10B981' }}
            thumbColor={biometricEnabled ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={exportWallet}>
          <View style={styles.settingLeft}>
            <Download size={20} color="#3B82F6" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Export Wallet</Text>
              <Text style={styles.settingDescription}>
                Show recovery phrase for backup
              </Text>
            </View>
          </View>
          <ExternalLink size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Auto-Convert Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Auto-Convert</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Zap size={20} color={autoConvert ? '#F97316' : '#9CA3AF'} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Auto-Convert Bitcoin</Text>
              <Text style={styles.settingDescription}>
                Automatically convert received BTC to ZMW
              </Text>
            </View>
          </View>
          <Switch
            value={autoConvert}
            onValueChange={handleAutoConvertToggle}
            trackColor={{ false: '#374151', true: '#F97316' }}
            thumbColor={autoConvert ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <View style={styles.infoCard}>
          <Info size={16} color="#3B82F6" />
          <Text style={styles.infoText}>
            Auto-convert uses YakiHonne's fully decentralized peer-to-peer network to ensure best rates 
            with zero data collection and complete user sovereignty.
          </Text>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Smartphone size={20} color={notificationsEnabled ? '#10B981' : '#9CA3AF'} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Transaction Alerts</Text>
              <Text style={styles.settingDescription}>
                Local notifications for transactions
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#374151', true: '#10B981' }}
            thumbColor={notificationsEnabled ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
      </View>

      {/* Transaction Collection Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Collection</Text>
        
        <View style={styles.addressDisplayCard}>
          <Text style={styles.addressDisplayLabel}>Fee Collection Address</Text>
          <Text style={styles.collectionAddress}>
            bc1pax0kxjzq6wamarvpxgt8unhzqyz0elm8g7frxajg34wIxcpsy5wzen
          </Text>
          <TouchableOpacity 
            style={styles.copyAddressButton}
            onPress={() => Alert.alert('Copied', 'Collection address copied to clipboard')}
          >
            <Text style={styles.copyAddressText}>Copy Address</Text>
          </TouchableOpacity>
          <Text style={styles.addressNote}>
            Network fees and protocol fees are collected at this address to maintain 
            the decentralized infrastructure. All transactions are transparent on the Bitcoin blockchain.
          </Text>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => openLink('https://yakihonne.com')}
        >
          <View style={styles.settingLeft}>
            <Globe size={20} color="#9CA3AF" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>YakiHonne Protocol</Text>
              <Text style={styles.settingDescription}>
                Learn about our decentralized infrastructure
              </Text>
            </View>
          </View>
          <ExternalLink size={16} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.versionCard}>
          <Text style={styles.versionText}>VOLTX v1.0.0</Text>
          <Text style={styles.versionSubtext}>
            Fully Decentralized • Zero Data Collection • Open Source
          </Text>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerSection}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        
        <TouchableOpacity style={styles.dangerItem} onPress={clearData}>
          <View style={styles.settingLeft}>
            <Trash2 size={20} color="#EF4444" />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, styles.dangerLabel]}>
                Clear All Data
              </Text>
              <Text style={styles.settingDescription}>
                Permanently delete wallet and transaction history
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.protocolBadge}>
          <Shield size={16} color="#10B981" />
          <Text style={styles.protocolText}>
            Secured by YakiHonne Protocol
          </Text>
        </View>
        <Text style={styles.footerText}>
          Your keys, your Bitcoin. Fully decentralized, always.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
    marginLeft: 8,
    flex: 1,
  },
  versionCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dangerSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 16,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dangerLabel: {
    color: '#EF4444',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  protocolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  protocolText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  addressDisplayCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  addressDisplayLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 8,
  },
  collectionAddress: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    lineHeight: 16,
  },
  copyAddressButton: {
    backgroundColor: '#F97316',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  copyAddressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  addressNote: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 14,
  },
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Eye, EyeOff, Copy, QrCode, Zap, Shield, ArrowRightLeft, Download, Send } from 'lucide-react-native';
import WalliLogo from '@/components/WalliLogo';
import { WalletService } from '@/services/WalletService';
import { SecurityService } from '@/services/SecurityService';
import SendBitcoinModal from '@/components/SendBitcoinModal';
import { BitcoinTransfer } from '@/services/TransferService';

export default function WalletScreen() {
  const [balances, setBalances] = useState({ btc: 0, zmw: 0 });
  const [btcAddress, setBtcAddress] = useState('');
  const [lightningAddress, setLightningAddress] = useState('');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      // Initialize security first
      const authenticated = await SecurityService.authenticate();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Load wallet data
        const wallet = await WalletService.getWallet();
        
        if (wallet) {
          setBtcAddress(wallet.btcAddress);
          setLightningAddress(wallet.lightningAddress);
        } else {
          // Initialize wallet if it doesn't exist
          const newWallet = await WalletService.initializeWallet();
          setBtcAddress(newWallet.btcAddress);
          setLightningAddress(newWallet.lightningAddress);
        }
        
        // Load balances
        const balanceData = await WalletService.getBalances();
        setBalances(balanceData);

        // Check stealth mode setting
        const stealth = await WalletService.getStealthMode();
        setStealthMode(stealth);
      }
    } catch (error) {
      console.error('Wallet initialization failed:', error);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    // In a real app, this would use Clipboard API
    Alert.alert('Copied', `${type} address copied to clipboard`);
  };

  const handleTransferComplete = (transfer: BitcoinTransfer) => {
    // Refresh balances after successful transfer
    initializeWallet();
    Alert.alert(
      'Transfer Complete',
      `Your ${transfer.type === 'onchain' ? 'Bitcoin' : 'Lightning'} transfer has been completed successfully.`
    );
  };

  const formatBalance = (amount: number, currency: string) => {
    if (stealthMode && currency === 'ZMW') {
      return '••••••';
    }
    if (currency === 'BTC') {
      return `₿${amount.toFixed(8)}`;
    }
    return `K${amount.toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`;
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authContainer}>
          <Shield size={64} color="#F97316" />
          <Text style={styles.authTitle}>Secure Access</Text>
          <Text style={styles.authSubtitle}>
            Use biometric authentication to access your wallet
          </Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={initializeWallet}
          >
            <Text style={styles.authButtonText}>Authenticate</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.appTitleContainer}>
            <WalliLogo size={28} />
            <Text style={styles.appTitle}>VOLTX</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setStealthMode(!stealthMode)}
            style={styles.stealthButton}
          >
            {stealthMode ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Non-custodial • KYC-free • YakiHonne Protocol</Text>
      </View>

      {/* Balance Cards */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Bitcoin</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
              {balanceVisible ? (
                <Eye size={16} color="#9CA3AF" />
              ) : (
                <EyeOff size={16} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {balanceVisible ? formatBalance(balances.btc, 'BTC') : '••••••••'}
          </Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Zambian Kwacha</Text>
          </View>
          <Text style={styles.balanceAmount}>
            {balanceVisible ? formatBalance(balances.zmw, 'ZMW') : '••••••••'}
          </Text>
        </View>
      </View>

      {/* Receive Addresses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Receive Bitcoin</Text>
        
        <View style={styles.addressContainer}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressLabel}>On-chain Address</Text>
            <View style={styles.addressActions}>
              <TouchableOpacity onPress={() => copyToClipboard(btcAddress, 'Bitcoin')}>
                <Copy size={16} color="#F97316" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.qrButton}>
                <QrCode size={16} color="#F97316" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.address}>{btcAddress}</Text>
        </View>

        <View style={styles.addressContainer}>
          <View style={styles.addressHeader}>
            <View style={styles.lightningHeader}>
              <Zap size={16} color="#F97316" />
              <Text style={styles.addressLabel}>Lightning Address</Text>
            </View>
            <View style={styles.addressActions}>
              <TouchableOpacity onPress={() => copyToClipboard(lightningAddress, 'Lightning')}>
                <Copy size={16} color="#F97316" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.qrButton}>
                <QrCode size={16} color="#F97316" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.address}>{lightningAddress}</Text>
        </View>
      </View>

      {/* Auto-convert Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Auto-convert Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusText}>Active</Text>
          </View>
          <Text style={styles.statusDescription}>
            Incoming Bitcoin will be automatically converted to ZMW via decentralized YakiHonne protocol - no intermediaries
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowSendModal(true)}
          >
            <Send size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Send Bitcoin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <ArrowRightLeft size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Convert Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Download size={20} color="#F97316" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Withdraw ZMW
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Send Bitcoin Modal */}
      <SendBitcoinModal
        visible={showSendModal}
        onClose={() => setShowSendModal(false)}
        onTransferComplete={handleTransferComplete}
      />
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stealthButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  authButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  balanceContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  balanceCard: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  addressContainer: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lightningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  qrButton: {
    marginLeft: 4,
  },
  address: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  statusCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  statusDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F97316',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#F97316',
  },
});
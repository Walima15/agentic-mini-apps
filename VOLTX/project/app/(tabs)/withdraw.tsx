import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Smartphone, ChevronDown, Shield, Clock } from 'lucide-react-native';

interface MobileProvider {
  id: string;
  name: string;
  logo: string;
  fees: number;
  processingTime: string;
}

export default function WithdrawScreen() {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<MobileProvider | null>(null);
  const [showProviders, setShowProviders] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const providers: MobileProvider[] = [
    {
      id: 'mtn',
      name: 'MTN Mobile Money',
      logo: '📱',
      fees: 0.5,
      processingTime: '1-3 minutes'
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      logo: '📲',
      fees: 0.3,
      processingTime: '2-5 minutes'
    }
  ];

  const handleWithdraw = async () => {
    if (!amount || !phoneNumber || !selectedProvider) {
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would integrate with mobile money APIs
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form after successful withdrawal
      setAmount('');
      setPhoneNumber('');
      setSelectedProvider(null);
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!amount || !selectedProvider) return 0;
    const amountNum = parseFloat(amount);
    const fee = (amountNum * selectedProvider.fees) / 100;
    return amountNum - fee;
  };

  const formatPhoneNumber = (input: string) => {
    // Format Zambian phone numbers
    const cleaned = input.replace(/\D/g, '');
    if (cleaned.startsWith('260')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return '260' + cleaned.slice(1);
    } else if (cleaned.length === 9) {
      return '260' + cleaned;
    }
    return cleaned;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Withdraw ZMW</Text>
        <Text style={styles.subtitle}>
          Send funds to your mobile money account
        </Text>
      </View>

      {/* Available Balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>K12,450.75</Text>
        <Text style={styles.balanceNote}>
          Converted from Bitcoin via YakiHonne protocol
        </Text>
      </View>

      {/* Amount Input */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencyPrefix}>K</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#6B7280"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <TouchableOpacity 
            style={styles.maxButton}
            onPress={() => setAmount('12450.75')}
          >
            <Text style={styles.maxText}>MAX</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mobile Provider Selection */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Mobile Money Provider</Text>
        <TouchableOpacity
          style={styles.providerSelector}
          onPress={() => setShowProviders(!showProviders)}
        >
          <View style={styles.providerSelectorContent}>
            {selectedProvider ? (
              <View style={styles.selectedProvider}>
                <Text style={styles.providerLogo}>{selectedProvider.logo}</Text>
                <Text style={styles.providerName}>{selectedProvider.name}</Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>Select provider</Text>
            )}
            <ChevronDown size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {showProviders && (
          <View style={styles.providerList}>
            {providers.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={styles.providerOption}
                onPress={() => {
                  setSelectedProvider(provider);
                  setShowProviders(false);
                }}
              >
                <View style={styles.providerInfo}>
                  <Text style={styles.providerLogo}>{provider.logo}</Text>
                  <View style={styles.providerDetails}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <Text style={styles.providerMeta}>
                      {provider.fees}% fee • {provider.processingTime}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Phone Number Input */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Mobile Number</Text>
        <View style={styles.phoneContainer}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>🇿🇲 +260</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="97 123 4567"
            placeholderTextColor="#6B7280"
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
            keyboardType="phone-pad"
          />
        </View>
        <Text style={styles.phoneNote}>
          Enter your registered mobile money number
        </Text>
      </View>

      {/* Transaction Summary */}
      {amount && selectedProvider && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Transaction Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Withdrawal Amount</Text>
            <Text style={styles.summaryValue}>K{amount}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Provider Fee ({selectedProvider.fees}%)</Text>
            <Text style={styles.summaryValue}>
              -K{((parseFloat(amount || '0') * selectedProvider.fees) / 100).toFixed(2)}
            </Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>You'll Receive</Text>
            <Text style={styles.totalValue}>K{calculateTotal().toFixed(2)}</Text>
          </View>
          
          <View style={styles.processingInfo}>
            <Clock size={14} color="#F97316" />
            <Text style={styles.processingText}>
              Processing time: {selectedProvider.processingTime}
            </Text>
          </View>
        </View>
      )}

      {/* Security Notice */}
      <View style={styles.securityCard}>
        <View style={styles.securityHeader}>
          <Shield size={16} color="#10B981" />
          <Text style={styles.securityTitle}>Secure Transfer</Text>
        </View>
        <Text style={styles.securityText}>
          All withdrawals are processed through YakiHonne's fully decentralized 
          peer-to-peer network with zero data collection or storage.
        </Text>
      </View>

      {/* Withdraw Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.withdrawButton,
            (!amount || !phoneNumber || !selectedProvider || isLoading) && styles.disabledButton
          ]}
          onPress={handleWithdraw}
          disabled={!amount || !phoneNumber || !selectedProvider || isLoading}
        >
          <Smartphone size={20} color="#FFFFFF" />
          <Text style={styles.withdrawButtonText}>
            {isLoading ? 'Processing...' : 'Withdraw to Mobile Money'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>
          Withdrawals are processed via YakiHonne's fully decentralized peer-to-peer network. Please double-check your mobile number.
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
  balanceCard: {
    margin: 20,
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  balanceNote: {
    fontSize: 12,
    color: '#10B981',
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    overflow: 'hidden',
  },
  currencyPrefix: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
    paddingLeft: 16,
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 16,
    fontSize: 18,
    color: '#FFFFFF',
  },
  maxButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  maxText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  providerSelector: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  providerSelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  selectedProvider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerLogo: {
    fontSize: 20,
  },
  providerName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
  },
  providerList: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  providerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerDetails: {
    flex: 1,
  },
  providerMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  phoneContainer: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  countryCode: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  phoneNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  summaryCard: {
    margin: 20,
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
  },
  processingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  processingText: {
    fontSize: 12,
    color: '#F97316',
  },
  securityCard: {
    margin: 20,
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  securityText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  buttonContainer: {
    padding: 20,
  },
  withdrawButton: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#374151',
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});
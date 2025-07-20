import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  ScrollView,
  Alert 
} from 'react-native';
import { X, Bitcoin, Zap, Send, Clock, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react-native';
import { TransferService, BitcoinTransfer } from '@/services/TransferService';

interface SendBitcoinModalProps {
  visible: boolean;
  onClose: () => void;
  onTransferComplete?: (transfer: BitcoinTransfer) => void;
}

export default function SendBitcoinModal({ 
  visible, 
  onClose, 
  onTransferComplete 
}: SendBitcoinModalProps) {
  const [transferType, setTransferType] = useState<'onchain' | 'lightning'>('onchain');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [feeRate, setFeeRate] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [isLoading, setIsLoading] = useState(false);
  const [currentFees, setCurrentFees] = useState({ slow: 0.00001, normal: 0.000015, fast: 0.000025 });

  React.useEffect(() => {
    if (visible) {
      loadCurrentFees();
    }
  }, [visible]);

  const loadCurrentFees = async () => {
    try {
      const fees = await TransferService.getCurrentNetworkFees();
      setCurrentFees(fees);
    } catch (error) {
      console.error('Failed to load current fees:', error);
    }
  };

  const validateInputs = (): boolean => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid Bitcoin amount');
      return false;
    }

    if (!recipientAddress.trim()) {
      Alert.alert('Missing Address', 'Please enter a recipient address');
      return false;
    }

    if (transferType === 'onchain') {
      if (!TransferService.validateBitcoinAddress(recipientAddress)) {
        Alert.alert('Invalid Address', 'Please enter a valid Bitcoin address');
        return false;
      }
    } else {
      if (!TransferService.validateLightningAddress(recipientAddress)) {
        Alert.alert('Invalid Address', 'Please enter a valid Lightning address');
        return false;
      }
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      let transfer: BitcoinTransfer;
      
      if (transferType === 'onchain') {
        transfer = await TransferService.sendBitcoinOnChain(
          recipientAddress,
          parseFloat(amount),
          feeRate
        );
      } else {
        transfer = await TransferService.sendBitcoinLightning(
          recipientAddress,
          parseFloat(amount)
        );
      }

      Alert.alert(
        'Transfer Initiated',
        `Your ${transferType === 'onchain' ? 'Bitcoin' : 'Lightning'} transfer has been initiated successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onTransferComplete?.(transfer);
              resetForm();
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Transfer Failed', error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRecipientAddress('');
    setAmount('');
    setFeeRate('normal');
    setTransferType('onchain');
  };

  const calculateEstimatedFee = (): number => {
    if (!amount || isNaN(parseFloat(amount))) return 0;
    
    const amountNum = parseFloat(amount);
    const protocolFee = amountNum * 0.005; // 0.5%
    
    if (transferType === 'onchain') {
      const networkFee = currentFees[feeRate];
      return networkFee + protocolFee;
    } else {
      const lightningFee = Math.max(amountNum * 0.001, 0.000001); // 0.1% min 100 sats
      return lightningFee + protocolFee;
    }
  };

  const getConfirmationTime = (): string => {
    if (transferType === 'lightning') return '~5 seconds';
    
    const times = {
      slow: '~1 hour',
      normal: '~30 minutes', 
      fast: '~10 minutes'
    };
    
    return times[feeRate];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Send Bitcoin</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Transfer Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transfer Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  transferType === 'onchain' && styles.selectedType
                ]}
                onPress={() => setTransferType('onchain')}
              >
                <Bitcoin size={20} color={transferType === 'onchain' ? '#F97316' : '#9CA3AF'} />
                <Text style={[
                  styles.typeText,
                  transferType === 'onchain' && styles.selectedTypeText
                ]}>
                  On-Chain
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  transferType === 'lightning' && styles.selectedType
                ]}
                onPress={() => setTransferType('lightning')}
              >
                <Zap size={20} color={transferType === 'lightning' ? '#F97316' : '#9CA3AF'} />
                <Text style={[
                  styles.typeText,
                  transferType === 'lightning' && styles.selectedTypeText
                ]}>
                  Lightning
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recipient Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {transferType === 'onchain' ? 'Bitcoin Address' : 'Lightning Address'}
            </Text>
            <TextInput
              style={styles.addressInput}
              placeholder={
                transferType === 'onchain' 
                  ? 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
                  : 'user@domain.com'
              }
              placeholderTextColor="#6B7280"
              value={recipientAddress}
              onChangeText={setRecipientAddress}
              multiline={transferType === 'onchain'}
              numberOfLines={transferType === 'onchain' ? 2 : 1}
            />
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={styles.amountContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00000000"
                placeholderTextColor="#6B7280"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <Text style={styles.currencyLabel}>BTC</Text>
            </View>
          </View>

          {/* Fee Selection (On-Chain Only) */}
          {transferType === 'onchain' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Network Fee</Text>
              <View style={styles.feeSelector}>
                {(['slow', 'normal', 'fast'] as const).map((rate) => (
                  <TouchableOpacity
                    key={rate}
                    style={[
                      styles.feeOption,
                      feeRate === rate && styles.selectedFee
                    ]}
                    onPress={() => setFeeRate(rate)}
                  >
                    <Text style={[
                      styles.feeLabel,
                      feeRate === rate && styles.selectedFeeText
                    ]}>
                      {rate.charAt(0).toUpperCase() + rate.slice(1)}
                    </Text>
                    <Text style={styles.feeAmount}>
                      ₿{currentFees[rate].toFixed(8)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Transaction Summary */}
          {amount && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Transaction Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>₿{amount}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Estimated Fee</Text>
                <Text style={styles.summaryValue}>₿{calculateEstimatedFee().toFixed(8)}</Text>
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ₿{(parseFloat(amount) + calculateEstimatedFee()).toFixed(8)}
                </Text>
              </View>
              
              <View style={styles.timeInfo}>
                <Clock size={14} color="#F97316" />
                <Text style={styles.timeText}>
                  Confirmation time: {getConfirmationTime()}
                </Text>
              </View>
            </View>
          )}

          {/* Fee Collection Notice */}
          <View style={styles.feeNotice}>
            <AlertCircle size={16} color="#3B82F6" />
            <Text style={styles.feeNoticeText}>
              Protocol fees are automatically collected to maintain the decentralized network infrastructure.
            </Text>
          </View>
        </ScrollView>

        {/* Send Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!amount || !recipientAddress || isLoading) && styles.disabledButton
            ]}
            onPress={handleSend}
            disabled={!amount || !recipientAddress || isLoading}
          >
            {isLoading ? (
              <Text style={styles.sendButtonText}>Processing...</Text>
            ) : (
              <>
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.sendButtonText}>
                  Send {transferType === 'onchain' ? 'Bitcoin' : 'Lightning'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    gap: 8,
  },
  selectedType: {
    borderColor: '#F97316',
    backgroundColor: '#1F2937',
  },
  typeText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  selectedTypeText: {
    color: '#F97316',
  },
  addressInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 16,
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  amountContainer: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    padding: 16,
    fontSize: 18,
    color: '#FFFFFF',
  },
  currencyLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
    paddingRight: 16,
  },
  feeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  feeOption: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  selectedFee: {
    borderColor: '#F97316',
  },
  feeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedFeeText: {
    color: '#F97316',
  },
  feeAmount: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  summaryCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#F97316',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  timeText: {
    fontSize: 12,
    color: '#F97316',
  },
  feeNotice: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 8,
  },
  feeNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  sendButton: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#374151',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
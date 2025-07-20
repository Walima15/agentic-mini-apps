import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Filter, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Send, Bitcoin, Zap } from 'lucide-react-native';
import { TransferService, BitcoinTransfer } from '@/services/TransferService';

interface Transaction {
  id: string;
  type: 'receive' | 'convert' | 'withdraw' | 'send_onchain' | 'send_lightning';
  amount: number;
  currency: 'BTC' | 'ZMW';
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  hash?: string;
  fee?: number;
  provider?: string;
  toAddress?: string;
}

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'receive' | 'convert' | 'withdraw' | 'send'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      // Load Bitcoin transfers
      const bitcoinTransfers = await TransferService.getTransferHistory();
      
      // Mock transaction data - in a real app, this would come from local storage
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'receive',
          amount: 0.00125,
          currency: 'BTC',
          status: 'completed',
          timestamp: new Date('2024-01-15T10:30:00'),
          hash: 'abc123...def456'
        },
        {
          id: '2',
          type: 'convert',
          amount: 850.50,
          currency: 'ZMW',
          status: 'completed',
          timestamp: new Date('2024-01-15T10:32:00'),
          fee: 0.00001
        },
        {
          id: '3',
          type: 'withdraw',
          amount: 500.00,
          currency: 'ZMW',
          status: 'completed',
          timestamp: new Date('2024-01-14T16:45:00'),
          provider: 'MTN Mobile Money'
        },
        {
          id: '4',
          type: 'receive',
          amount: 0.00089,
          currency: 'BTC',
          status: 'pending',
          timestamp: new Date('2024-01-14T14:20:00'),
          hash: 'xyz789...uvw012'
        },
        {
          id: '5',
          type: 'convert',
          amount: 1200.75,
          currency: 'ZMW',
          status: 'failed',
          timestamp: new Date('2024-01-13T11:15:00'),
          fee: 0.00001
        }
      ];
      
      // Convert Bitcoin transfers to transaction format
      const transferTransactions: Transaction[] = bitcoinTransfers.map((transfer: BitcoinTransfer) => ({
        id: transfer.id,
        type: transfer.type === 'onchain' ? 'send_onchain' : 'send_lightning',
        amount: transfer.amount,
        currency: 'BTC' as const,
        status: transfer.status === 'confirmed' ? 'completed' : transfer.status === 'failed' ? 'failed' : 'pending',
        timestamp: new Date(transfer.timestamp),
        hash: transfer.txHash,
        fee: transfer.fee,
        toAddress: transfer.toAddress
      }));
      
      // Combine and sort all transactions by timestamp
      const allTransactions = [...mockTransactions, ...transferTransactions].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || 
    tx.type === filter || 
    (filter === 'send' && (tx.type === 'send_onchain' || tx.type === 'send_lightning'))
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color="#10B981" />;
      case 'pending':
        return <Clock size={16} color="#F97316" />;
      case 'failed':
        return <AlertCircle size={16} color="#EF4444" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F97316';
      case 'failed':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'receive':
        return <ArrowDownLeft size={20} color="#10B981" />;
      case 'convert':
        return <RefreshCw size={20} color="#F97316" />;
      case 'withdraw':
        return <ArrowUpRight size={20} color="#3B82F6" />;
      case 'send_onchain':
        return <Bitcoin size={20} color="#EF4444" />;
      case 'send_lightning':
        return <Zap size={20} color="#EF4444" />;
      default:
        return null;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'BTC') {
      return `₿${amount.toFixed(8)}`;
    }
    return `K${amount.toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-ZM');
    }
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'send_onchain':
        return 'Send Bitcoin';
      case 'send_lightning':
        return 'Send Lightning';
      default:
        return capitalizeFirst(type);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.subtitle}>
          All transactions are stored locally on your device
        </Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {(['all', 'receive', 'send', 'convert', 'withdraw'] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterTab,
              filter === filterType && styles.activeFilterTab
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[
              styles.filterText,
              filter === filterType && styles.activeFilterText
            ]}>
              {capitalizeFirst(filterType)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transaction List */}
      <ScrollView style={styles.transactionList}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Filter size={48} color="#6B7280" />
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? 'Your transaction history will appear here'
                : `No ${filter} transactions yet`
              }
            </Text>
          </View>
        ) : (
          filteredTransactions.map((transaction) => (
            <TouchableOpacity key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionIcon}>
                  {getTransactionIcon(transaction.type)}
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>
                    {getTransactionTypeLabel(transaction.type)} {transaction.currency}
                  </Text>
                  <Text style={styles.transactionTime}>
                    {formatDate(transaction.timestamp)}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={styles.amountText}>
                    {formatAmount(transaction.amount, transaction.currency)}
                  </Text>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(transaction.status)}
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(transaction.status) }
                    ]}>
                      {capitalizeFirst(transaction.status)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Transaction Details */}
              <View style={styles.transactionDetails}>
                {transaction.hash && (
                  <Text style={styles.detailText}>
                    Hash: {transaction.hash}
                  </Text>
                )}
                {transaction.toAddress && (
                  <Text style={styles.detailText}>
                    To: {transaction.toAddress}
                  </Text>
                )}
                {transaction.provider && (
                  <Text style={styles.detailText}>
                    Provider: {transaction.provider}
                  </Text>
                )}
                {transaction.fee && (
                  <Text style={styles.detailText}>
                    Network Fee: ₿{transaction.fee.toFixed(8)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Refresh Button */}
      <View style={styles.refreshContainer}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadTransactions}
          disabled={isLoading}
        >
          <RefreshCw 
            size={16} 
            color={isLoading ? "#6B7280" : "#F97316"} 
            style={isLoading ? styles.spinning : undefined}
          />
          <Text style={[
            styles.refreshText,
            isLoading && styles.disabledText
          ]}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#1F2937',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  activeFilterTab: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  filterText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#374151',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  detailText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  refreshContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  refreshText: {
    fontSize: 14,
    color: '#F97316',
    fontWeight: '500',
  },
  disabledText: {
    color: '#6B7280',
  },
  spinning: {
    // Animation would be implemented with react-native-reanimated in a real app
  },
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { ArrowDown, RefreshCw, Zap, TrendingUp } from 'lucide-react-native';
import { ConversionService, Country, SOUTHERN_AFRICAN_COUNTRIES } from '@/services/ConversionService';

export default function ConvertScreen() {
  const [btcAmount, setBtcAmount] = useState('');
  const [localAmount, setLocalAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(SOUTHERN_AFRICAN_COUNTRIES[0]);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('2-5 minutes');
  const [networkFee, setNetworkFee] = useState(0.00001);

  useEffect(() => {
    loadSelectedCountry();
  }, []);

  useEffect(() => {
    loadExchangeRate();
  }, [selectedCountry]);

  const loadSelectedCountry = async () => {
    try {
      const country = await ConversionService.getSelectedCountry();
      setSelectedCountry(country);
    } catch (error) {
      console.error('Failed to load selected country:', error);
    }
  };

  const loadExchangeRate = async () => {
    try {
      const rate = await ConversionService.getBTCtoLocalRate(selectedCountry);
      setExchangeRate(rate);
    } catch (error) {
      console.error('Failed to load exchange rate:', error);
    }
  };

  const handleBtcAmountChange = (amount: string) => {
    setBtcAmount(amount);
    if (amount && !isNaN(parseFloat(amount))) {
      const local = parseFloat(amount) * exchangeRate;
      setLocalAmount(local.toFixed(2));
    } else {
      setLocalAmount('');
    }
  };

  const handleConvert = async () => {
    if (!btcAmount || isNaN(parseFloat(btcAmount))) {
      return;
    }

    setIsLoading(true);
    try {
      await ConversionService.convertBTCtoLocal(parseFloat(btcAmount), selectedCountry);
      // Reset form after successful conversion
      setBtcAmount('');
      setLocalAmount('');
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setMaxAmount = async () => {
    try {
      const maxBtc = await ConversionService.getMaxConvertibleAmount();
      setBtcAmount(maxBtc.toString());
      handleBtcAmountChange(maxBtc.toString());
    } catch (error) {
      console.error('Failed to get max amount:', error);
    }
  };

  const handleCountrySelect = async (country: Country) => {
    setSelectedCountry(country);
    setShowCountrySelector(false);
    await ConversionService.setSelectedCountry(country);
    // Recalculate amount with new country's rate
    if (btcAmount) handleBtcAmountChange(btcAmount);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Convert Bitcoin</Text>
        <Text style={styles.subtitle}>
          Auto-convert to {selectedCountry.currency} via fully decentralized YakiHonne protocol
        </Text>
      </View>

      {/* Country Selection */}
      <View style={styles.countrySection}>
        <Text style={styles.sectionTitle}>Select Country</Text>
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => setShowCountrySelector(!showCountrySelector)}
        >
          <View style={styles.selectedCountry}>
            <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
            <Text style={styles.countryName}>{selectedCountry.name}</Text>
            <Text style={styles.currencyCode}>({selectedCountry.currency})</Text>
          </View>
          <ArrowDown size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {showCountrySelector && (
          <View style={styles.countryList}>
            {SOUTHERN_AFRICAN_COUNTRIES.map((country) => (
              <TouchableOpacity
                key={country.id}
                style={[
                  styles.countryOption,
                  selectedCountry.id === country.id && styles.selectedCountryOption
                ]}
                onPress={() => handleCountrySelect(country)}
              >
                <Text style={styles.countryFlag}>{country.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text style={styles.countryName}>{country.name}</Text>
                  <Text style={styles.currencyInfo}>{country.currency} ({country.currencySymbol})</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Exchange Rate Card */}
      <View style={styles.rateCard}>
        <View style={styles.rateHeader}>
          <Text style={styles.rateLabel}>Current Rate</Text>
          <TouchableOpacity onPress={loadExchangeRate}>
            <RefreshCw size={16} color="#F97316" />
          </TouchableOpacity>
        </View>
        <Text style={styles.rateValue}>
          1 BTC = {selectedCountry.currencySymbol}{exchangeRate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        <View style={styles.rateDetails}>
          <View style={styles.rateItem}>
            <TrendingUp size={12} color="#10B981" />
            <Text style={styles.rateChange}>+2.3% (24h)</Text>
          </View>
          <Text style={styles.rateSource}>Via YakiHonne</Text>
        </View>
      </View>

      {/* Conversion Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>From (Bitcoin)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="0.00000000"
              placeholderTextColor="#6B7280"
              value={btcAmount}
              onChangeText={handleBtcAmountChange}
              keyboardType="numeric"
            />
            <View style={styles.inputSuffix}>
              <Text style={styles.currencyText}>BTC</Text>
              <TouchableOpacity onPress={setMaxAmount} style={styles.maxButton}>
                <Text style={styles.maxText}>MAX</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <ArrowDown size={24} color="#9CA3AF" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>To ({selectedCountry.name} {selectedCountry.currency})</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="0.00"
              placeholderTextColor="#6B7280"
              value={localAmount}
              editable={false}
            />
            <View style={styles.inputSuffix}>
              <Text style={styles.currencyText}>{selectedCountry.currency}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Conversion Route */}
      <View style={styles.routeCard}>
        <Text style={styles.routeTitle}>Conversion Route</Text>
        <View style={styles.routeFlow}>
          <View style={styles.routeStep}>
            <Text style={styles.routeStepText}>BTC</Text>
          </View>
          <ArrowDown size={16} color="#9CA3AF" />
          <View style={styles.routeStep}>
            <Text style={styles.routeStepText}>USDT</Text>
          </View>
          <ArrowDown size={16} color="#9CA3AF" />
          <View style={styles.routeStep}>
            <Text style={styles.routeStepText}>{selectedCountry.currency}</Text>
          </View>
        </View>
        <Text style={styles.routeDescription}>
          Fully decentralized routing via YakiHonne peer-to-peer network for best rates
        </Text>
      </View>

      {/* Transaction Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Transaction Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Network Fee</Text>
          <Text style={styles.detailValue}>₿{networkFee.toFixed(8)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Estimated Time</Text>
          <View style={styles.timeContainer}>
            <Zap size={12} color="#F97316" />
            <Text style={styles.detailValue}>{estimatedTime}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Privacy</Text>
          <Text style={styles.privacyText}>Fully Decentralized • Zero Data Collection</Text>
        </View>
      </View>

      {/* Convert Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.convertButton,
            (!btcAmount || isLoading) && styles.disabledButton
          ]}
          onPress={handleConvert}
          disabled={!btcAmount || isLoading}
        >
          {isLoading ? (
            <RefreshCw size={20} color="#FFFFFF" />
          ) : (
            <ArrowDown size={20} color="#FFFFFF" />
          )}
          <Text style={styles.convertButtonText}>
            {isLoading ? 'Converting...' : 'Convert Bitcoin'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>
          Conversions are processed via YakiHonne's fully decentralized peer-to-peer network
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
  countrySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  countrySelector: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCountry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  currencyCode: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  countryList: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    gap: 12,
  },
  selectedCountryOption: {
    backgroundColor: '#374151',
  },
  countryInfo: {
    flex: 1,
  },
  currencyInfo: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  rateCard: {
    margin: 20,
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rateLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  rateValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  rateDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rateChange: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  rateSource: {
    fontSize: 12,
    color: '#6B7280',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  disabledInput: {
    color: '#9CA3AF',
  },
  inputSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#374151',
    gap: 8,
  },
  currencyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  maxButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F97316',
    borderRadius: 6,
  },
  maxText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  arrowContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  routeCard: {
    margin: 20,
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  routeFlow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  routeStep: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  routeStepText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  routeDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  detailsCard: {
    margin: 20,
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  privacyText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 20,
  },
  convertButton: {
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
  convertButtonText: {
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
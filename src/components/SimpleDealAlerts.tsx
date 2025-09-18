import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../utils/theme';
import { User } from '../types';
import { CANADIAN_PROVINCES } from '../data/canadianData';

interface SimpleDealAlertsProps {
  user: User;
}

export const SimpleDealAlerts: React.FC<SimpleDealAlertsProps> = ({ user }) => {
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(100);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [customStore, setCustomStore] = useState('');
  const [storeSuggestions, setStoreSuggestions] = useState<string[]>([]);
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('on');
  const [keywords, setKeywords] = useState<string[]>(['electronics', 'groceries']);
  const [newKeyword, setNewKeyword] = useState('');
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);

  const categories = ['Electronics', 'Groceries', 'Clothing', 'Home & Garden'];
  const stores = ['Walmart', 'Shoppers Drug Mart', 'London Drugs', 'Save-on-Foods', 'Costco', 'Canadian Tire', 'Best Buy', 'Metro', 'Sobeys', 'Loblaws', 'The Source', 'Winners', 'HomeSense', 'IKEA', 'Home Depot'];

  const popularKeywords = ['iPhone', 'Samsung', 'laptop', 'TV', 'headphones', 'gaming', 'Nike', 'Adidas', 'coffee', 'protein', 'vitamins', 'skincare', 'furniture', 'kitchen', 'camping', 'bicycle', 'baby', 'toys', 'books', 'chocolate'];

  const handleStoreInputChange = (text: string) => {
    setCustomStore(text);
    if (text.length > 0) {
      const filtered = stores.filter(store =>
        store.toLowerCase().includes(text.toLowerCase())
      );
      setStoreSuggestions(filtered.slice(0, 5));
      setShowStoreSuggestions(filtered.length > 0);
    } else {
      setShowStoreSuggestions(false);
    }
  };

  const selectStoreSuggestion = (store: string) => {
    setCustomStore(store);
    setShowStoreSuggestions(false);
  };

  const handleKeywordInputChange = (text: string) => {
    setNewKeyword(text);
    if (text.length > 0) {
      const filtered = popularKeywords.filter(keyword =>
        keyword.toLowerCase().includes(text.toLowerCase()) &&
        !keywords.includes(keyword.toLowerCase())
      );
      setKeywordSuggestions(filtered.slice(0, 5));
      setShowKeywordSuggestions(filtered.length > 0);
    } else {
      setShowKeywordSuggestions(false);
    }
  };

  const selectKeywordSuggestion = (keyword: string) => {
    setKeywords([...keywords, keyword.toLowerCase()]);
    setNewKeyword('');
    setShowKeywordSuggestions(false);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim().toLowerCase())) {
      setKeywords([...keywords, newKeyword.trim().toLowerCase()]);
      setNewKeyword('');
      setShowKeywordSuggestions(false);
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Deal Alerts</Text>
        <Text style={styles.subtitle}>Get notified about deals near you</Text>
      </View>

      {/* Enable Alerts */}
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Deal Alerts</Text>
          <Switch
            value={alertsEnabled}
            onValueChange={setAlertsEnabled}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.foreground,
            }}
            thumbColor={theme.colors.background}
          />
        </View>
      </View>

      {alertsEnabled && (
        <>
          {/* Location & GPS Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Settings</Text>

            {/* GPS Toggle */}
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>GPS Location</Text>
              <Switch
                value={gpsEnabled}
                onValueChange={setGpsEnabled}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.foreground,
                }}
                thumbColor={theme.colors.background}
              />
            </View>

            {/* Alert Radius */}
            <View style={styles.settingGroup}>
              <Text style={styles.pickerLabel}>Alert Radius</Text>
              <View style={styles.nativePicker}>
                <Picker
                  selectedValue={selectedRadius}
                  onValueChange={setSelectedRadius}
                  style={styles.picker}
                  dropdownIconColor={theme.colors.foreground}
                  mode="dropdown"
                >
                  <Picker.Item label="100 km" value={100} />
                  <Picker.Item label="City" value="city" />
                  <Picker.Item label="Province" value="province" />
                  <Picker.Item label="All" value="all" />
                </Picker>
              </View>
            </View>

            {/* Province/Region */}
            <View style={styles.settingGroup}>
              <Text style={styles.pickerLabel}>Province/Territory</Text>
              <View style={styles.nativePicker}>
                <Picker
                  selectedValue={selectedProvince}
                  onValueChange={setSelectedProvince}
                  style={styles.picker}
                  dropdownIconColor={theme.colors.foreground}
                  mode="dropdown"
                >
                  {CANADIAN_PROVINCES.map((province) => (
                    <Picker.Item
                      key={province.value}
                      label={province.label}
                      value={province.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Category Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Preferences</Text>
            <View style={styles.settingGroup}>
              <Text style={styles.pickerLabel}>Preferred Category</Text>
              <View style={styles.nativePicker}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={setSelectedCategory}
                  style={styles.picker}
                  dropdownIconColor={theme.colors.foreground}
                  mode="dropdown"
                >
                  <Picker.Item label="Select category..." value="" />
                  {categories.map((category) => (
                    <Picker.Item key={category} label={category} value={category} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Store Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Store Preferences</Text>
            <View style={styles.settingGroup}>
              <Text style={styles.pickerLabel}>Preferred Store</Text>
              <View style={styles.nativePicker}>
                <Picker
                  selectedValue={selectedStore}
                  onValueChange={setSelectedStore}
                  style={styles.picker}
                  dropdownIconColor={theme.colors.foreground}
                  mode="dropdown"
                >
                  <Picker.Item label="Select store..." value="" />
                  {stores.map((store) => (
                    <Picker.Item key={store} label={store} value={store} />
                  ))}
                  <Picker.Item label="Other (specify below)" value="other" />
                </Picker>
              </View>
              {selectedStore === 'other' && (
                <View style={styles.autocompleteContainer}>
                  <TextInput
                    style={styles.customInput}
                    placeholder="Enter store name..."
                    value={customStore}
                    onChangeText={handleStoreInputChange}
                    placeholderTextColor={theme.colors.mutedForeground}
                  />
                  {showStoreSuggestions && (
                    <View style={styles.suggestionsContainer}>
                      {storeSuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => selectStoreSuggestion(suggestion)}
                        >
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Keywords Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Keywords</Text>
            <View style={styles.keywordsContainer}>
              {keywords.map((keyword, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.keywordPill}
                  onPress={() => removeKeyword(keyword)}
                >
                  <Text style={styles.keywordText}>{keyword}</Text>
                  <Text style={styles.keywordRemove}>×</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keywordInputContainer}>
              <View style={styles.keywordInput}>
                <TextInput
                  style={styles.keywordTextInput}
                  placeholder="Add keyword..."
                  value={newKeyword}
                  onChangeText={handleKeywordInputChange}
                  onSubmitEditing={addKeyword}
                  placeholderTextColor={theme.colors.mutedForeground}
                />
                <TouchableOpacity style={styles.keywordAddButton} onPress={addKeyword}>
                  <Text style={styles.keywordAddText}>+</Text>
                </TouchableOpacity>
              </View>
              {showKeywordSuggestions && (
                <View style={styles.suggestionsContainer}>
                  {keywordSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => selectKeywordSuggestion(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          </TouchableOpacity>
        </>
      )}

      {!alertsEnabled && (
        <View style={styles.disabledMessage}>
          <Text style={styles.disabledText}>
            Enable deal alerts to get notified about great deals near your location.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.mutedForeground,
  },
  section: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingGroup: {
    gap: theme.spacing.sm,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.foreground,
    fontWeight: theme.fontWeight.medium,
  },
  pickerLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  nativePicker: {
    borderWidth: 2,
    borderColor: theme.colors.foreground,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: theme.colors.foreground,
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: theme.colors.foreground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  saveButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  disabledMessage: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.muted,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.lg,
  },
  disabledText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.foreground,
    textAlign: 'center',
    lineHeight: 22,
  },
  customInput: {
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.foreground,
    backgroundColor: theme.colors.input,
    marginTop: theme.spacing.sm,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  keywordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.foreground,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  keywordText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.foreground,
  },
  keywordRemove: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.destructive,
    fontWeight: theme.fontWeight.bold,
  },
  keywordInput: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  keywordTextInput: {
    flex: 1,
    height: 32,
    backgroundColor: theme.colors.input,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.foreground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  keywordAddButton: {
    width: 32,
    height: 32,
    backgroundColor: theme.colors.foreground,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keywordAddText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.background,
    fontWeight: theme.fontWeight.bold,
  },
  autocompleteContainer: {
    position: 'relative',
    marginTop: theme.spacing.sm,
  },
  keywordInputContainer: {
    position: 'relative',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    maxHeight: 150,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.foreground,
  },
});
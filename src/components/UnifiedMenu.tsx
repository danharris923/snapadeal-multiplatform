import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Linking,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../utils/theme';
import { User } from '../types';
import { CANADIAN_PROVINCES } from '../data/canadianData';
import { searchCanadianCities } from '../data/canadianCities';

interface UnifiedMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  navigation?: any;
}

export const UnifiedMenu: React.FC<UnifiedMenuProps> = ({
  isOpen,
  onClose,
  user,
  navigation,
}) => {
  // Notification/Deal Alert Settings
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [notificationArea, setNotificationArea] = useState('city');
  const [selectedCity, setSelectedCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [keywords, setKeywords] = useState<string[]>(['electronics', 'groceries']);
  const [newKeyword, setNewKeyword] = useState('');
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const [selectedStore, setSelectedStore] = useState('');
  const [customStore, setCustomStore] = useState('');
  const [storeSuggestions, setStoreSuggestions] = useState<string[]>([]);
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);

  // App Settings
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoPlayVideos, setAutoPlayVideos] = useState(true);

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

  const handleCityInputChange = (text: string) => {
    setSelectedCity(text);
    if (text.length > 0) {
      const suggestions = searchCanadianCities(text, 8);
      setCitySuggestions(suggestions);
      setShowCitySuggestions(suggestions.length > 0);
    } else {
      setShowCitySuggestions(false);
    }
  };

  const selectCitySuggestion = (city: string) => {
    setSelectedCity(city);
    setShowCitySuggestions(false);
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

  const handlePostDeal = () => {
    onClose();
    if (navigation) {
      navigation.navigate('SnapDeal');
    }
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('userToken');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View style={styles.menuContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header with Close Button */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Section at Top */}
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileEmail}>{user?.email || 'Guest'}</Text>
                <Text style={styles.profileLevel}>Level 1 • 0 Points</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Deals</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Saves</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>$0</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </View>
            </View>
          </View>

          {/* Post Deal Button */}
          <TouchableOpacity style={styles.postDealButton} onPress={handlePostDeal}>
            <Text style={styles.postDealButtonText}>📸 Post a Deal</Text>
          </TouchableOpacity>

          {/* App Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.foreground,
                }}
                thumbColor={theme.colors.background}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.foreground,
                }}
                thumbColor={theme.colors.background}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Use Geolocation</Text>
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
          </View>

          {/* Deal Alerts / Notifications Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Deal Alerts & Notifications</Text>
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

            {alertsEnabled && (
              <>
                {/* Location Settings */}
                <View style={styles.subsection}>
                  <Text style={styles.subsectionTitle}>Location</Text>

                  <View style={styles.pickerGroup}>
                    <Text style={styles.pickerLabel}>Notification Area</Text>
                    <View style={styles.nativePicker}>
                      <Picker
                        selectedValue={notificationArea}
                        onValueChange={setNotificationArea}
                        style={styles.picker}
                        dropdownIconColor={theme.colors.foreground}
                        mode="dropdown"
                      >
                        <Picker.Item label="City Only" value="city" />
                        <Picker.Item label="Province" value="province" />
                        <Picker.Item label="All Canada" value="canada" />
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.pickerGroup}>
                    <Text style={styles.pickerLabel}>City / Town / Postal Code</Text>
                    <View style={styles.autocompleteContainer}>
                      <TextInput
                        style={styles.customInput}
                        placeholder="Enter city, town, or postal code..."
                        value={selectedCity || postalCode}
                        onChangeText={(text) => {
                          // Check if input looks like postal code (contains letters and numbers)
                          if (/^[A-Za-z]\d[A-Za-z]/.test(text)) {
                            setPostalCode(text.toUpperCase());
                            setSelectedCity('');
                            setShowCitySuggestions(false);
                          } else {
                            handleCityInputChange(text);
                            setPostalCode('');
                          }
                        }}
                        placeholderTextColor={theme.colors.mutedForeground}
                        autoCapitalize="characters"
                      />
                      {showCitySuggestions && citySuggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                          {citySuggestions.map((suggestion, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.suggestionItem}
                              onPress={() => selectCitySuggestion(suggestion)}
                            >
                              <Text style={styles.suggestionText}>{suggestion}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                    <Text style={styles.helperText}>
                      Enter city name or postal code (e.g., M5V 3A8)
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Footer Links */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => {
              onClose();
              if (navigation) {
                navigation.navigate('Privacy');
              }
            }}>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              onClose();
              if (navigation) {
                navigation.navigate('Terms');
              }
            }}>
              <Text style={styles.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
            {user && (
              <TouchableOpacity onPress={handleSignOut}>
                <Text style={[styles.footerLink, styles.signOutLink]}>Sign Out</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.versionText}>ver# 20251001_2204-secure</Text>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '85%',
    maxWidth: 350,
    backgroundColor: theme.colors.background,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.foreground,
  },
  profileSection: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.foreground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.foreground,
    marginBottom: 2,
  },
  profileLevel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.sm,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedForeground,
  },
  postDealButton: {
    backgroundColor: theme.colors.foreground,
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  postDealButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.foreground,
  },
  subsection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  subsectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.foreground,
  },
  pickerGroup: {
    marginTop: theme.spacing.sm,
  },
  pickerLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  nativePicker: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    color: theme.colors.foreground,
    backgroundColor: 'transparent',
  },
  autocompleteContainer: {
    position: 'relative',
    marginTop: theme.spacing.sm,
  },
  customInput: {
    height: 36,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.foreground,
    backgroundColor: theme.colors.input,
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
    maxHeight: 120,
    zIndex: 1000,
    elevation: 5,
  },
  suggestionItem: {
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.foreground,
  },
  keywordsSection: {
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
    paddingVertical: 2,
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
  keywordInputContainer: {
    position: 'relative',
  },
  keywordInput: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  keywordTextInput: {
    flex: 1,
    height: 30,
    backgroundColor: theme.colors.input,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.foreground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  keywordAddButton: {
    width: 30,
    height: 30,
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
  helperText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  footer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  footerLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
    paddingVertical: theme.spacing.xs,
  },
  signOutLink: {
    color: theme.colors.destructive,
    fontWeight: theme.fontWeight.medium,
    marginTop: theme.spacing.sm,
  },
  bottomPadding: {
    height: theme.spacing.xl,
  },
  versionText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    fontFamily: 'monospace',
  },
});
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../utils/theme';
import { User, NotificationPreferences } from '../types';
import { notificationService } from '../services/notifications';
import { CANADIAN_PROVINCES, CANADIAN_STORES, DEAL_CATEGORIES, getAllStoreNames } from '../data/canadianData';

interface DealAlertsProps {
  user: User;
}

export const DealAlerts: React.FC<DealAlertsProps> = ({ user }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // UI state for native pickers
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState('');

  useEffect(() => {
    loadPreferences();
  }, [user.id]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await notificationService.getNotificationPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (updatedPrefs: Partial<NotificationPreferences>) => {
    if (!preferences) return;

    try {
      setSaving(true);
      await notificationService.updateNotificationPreferences(user.id, updatedPrefs);
      setPreferences({ ...preferences, ...updatedPrefs });
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleMainToggle = async (enabled: boolean) => {
    if (enabled) {
      // Initialize push notifications when enabling
      await notificationService.initializePushNotifications(user.id);
    }

    await savePreferences({
      push_enabled: enabled,
      deal_alerts_enabled: enabled,
    });
  };

  const handleProximityToggle = async (enabled: boolean) => {
    await savePreferences({ proximity_enabled: enabled });
  };

  const addCategory = () => {
    if (!selectedCategory || !preferences) return;

    if (!preferences.alert_categories.includes(selectedCategory)) {
      const updatedCategories = [...preferences.alert_categories, selectedCategory];
      savePreferences({ alert_categories: updatedCategories });
    }
    setSelectedCategory('');
  };

  const removeCategory = (category: string) => {
    if (!preferences) return;
    const updatedCategories = preferences.alert_categories.filter(c => c !== category);
    savePreferences({ alert_categories: updatedCategories });
  };

  const addStore = () => {
    if (!selectedStore || !preferences) return;

    if (!preferences.alert_stores.includes(selectedStore)) {
      const updatedStores = [...preferences.alert_stores, selectedStore];
      savePreferences({ alert_stores: updatedStores });
    }
    setSelectedStore('');
  };

  const removeStore = (store: string) => {
    if (!preferences) return;
    const updatedStores = preferences.alert_stores.filter(s => s !== store);
    savePreferences({ alert_stores: updatedStores });
  };

  const handleRadiusChange = (radius: number) => {
    savePreferences({ proximity_radius: radius });
  };

  const handleMinDiscountChange = (discount: number) => {
    savePreferences({ min_discount_percentage: discount });
  };

  const handleMaxPriceChange = (price: number) => {
    savePreferences({ max_price: price });
  };

  const sendTestAlert = async () => {
    await notificationService.sendTestNotification(user.id);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading deal alerts...</Text>
      </View>
    );
  }

  if (!preferences) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load preferences</Text>
      </View>
    );
  }

  const storeNames = getAllStoreNames();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Deal Alerts</Text>
        <Text style={styles.headerSubtitle}>
          Get notified when deals match your interests and location
        </Text>
      </View>

      {/* Main Toggle */}
      <View style={styles.section}>
        <View style={styles.mainToggle}>
          <View style={styles.toggleContent}>
            <Text style={styles.toggleTitle}>Enable Deal Alerts</Text>
            <Text style={styles.toggleSubtitle}>
              Receive push notifications for deals that match your preferences
            </Text>
          </View>
          <Switch
            value={preferences.deal_alerts_enabled}
            onValueChange={handleMainToggle}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.foreground,
            }}
            thumbColor={theme.colors.background}
          />
        </View>
      </View>

      {preferences.deal_alerts_enabled && (
        <>
          {/* Location-Based Alerts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Location Alerts</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Notify for nearby deals</Text>
                <Text style={styles.settingSubtext}>
                  Get alerts for deals at stores within {preferences.proximity_radius}km
                </Text>
              </View>
              <Switch
                value={preferences.proximity_enabled}
                onValueChange={handleProximityToggle}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.foreground,
                }}
                thumbColor={theme.colors.background}
              />
            </View>

            {preferences.proximity_enabled && (
              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Alert Radius</Text>
                <View style={styles.nativePicker}>
                  <Picker
                    selectedValue={preferences.proximity_radius}
                    onValueChange={handleRadiusChange}
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
            )}
          </View>

          {/* Category Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Categories</Text>
            <Text style={styles.sectionSubtext}>
              Only get alerts for these categories (leave empty for all)
            </Text>

            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>Add Category</Text>
              <View style={styles.addItemRow}>
                <View style={[styles.nativePicker, { flex: 1 }]}>
                  <Picker
                    selectedValue={selectedCategory}
                    onValueChange={setSelectedCategory}
                    style={styles.picker}
                    dropdownIconColor={theme.colors.foreground}
                    mode="dropdown"
                  >
                    <Picker.Item label="Select category..." value="" />
                    {DEAL_CATEGORIES.map(category => (
                      <Picker.Item key={category} label={category} value={category} />
                    ))}
                  </Picker>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addCategory}
                  disabled={!selectedCategory}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.selectedItems}>
              {preferences.alert_categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={styles.selectedItem}
                  onPress={() => removeCategory(category)}
                >
                  <Text style={styles.selectedItemText}>{category}</Text>
                  <Text style={styles.removeIcon}>×</Text>
                </TouchableOpacity>
              ))}
              {preferences.alert_categories.length === 0 && (
                <Text style={styles.emptyText}>All categories enabled</Text>
              )}
            </View>
          </View>

          {/* Store Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏪 Stores</Text>
            <Text style={styles.sectionSubtext}>
              Only get alerts for these stores (leave empty for all)
            </Text>

            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>Add Store</Text>
              <View style={styles.addItemRow}>
                <View style={[styles.nativePicker, { flex: 1 }]}>
                  <Picker
                    selectedValue={selectedStore}
                    onValueChange={setSelectedStore}
                    style={styles.picker}
                    dropdownIconColor={theme.colors.foreground}
                    mode="dropdown"
                  >
                    <Picker.Item label="Select store..." value="" />
                    {storeNames.map(store => (
                      <Picker.Item key={store} label={store} value={store} />
                    ))}
                  </Picker>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addStore}
                  disabled={!selectedStore}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.selectedItems}>
              {preferences.alert_stores.map(store => (
                <TouchableOpacity
                  key={store}
                  style={styles.selectedItem}
                  onPress={() => removeStore(store)}
                >
                  <Text style={styles.selectedItemText}>{store}</Text>
                  <Text style={styles.removeIcon}>×</Text>
                </TouchableOpacity>
              ))}
              {preferences.alert_stores.length === 0 && (
                <Text style={styles.emptyText}>All stores enabled</Text>
              )}
            </View>
          </View>

          {/* Deal Value Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Deal Quality</Text>
            <Text style={styles.sectionSubtext}>
              Only notify for deals that meet these criteria
            </Text>

            <View style={styles.valueFilters}>
              <View style={styles.valueFilter}>
                <Text style={styles.pickerLabel}>Minimum Discount</Text>
                <View style={styles.nativePicker}>
                  <Picker
                    selectedValue={preferences.min_discount_percentage}
                    onValueChange={handleMinDiscountChange}
                    style={styles.picker}
                    dropdownIconColor={theme.colors.foreground}
                    mode="dropdown"
                  >
                    <Picker.Item label="Any discount" value={0} />
                    <Picker.Item label="10% off" value={10} />
                    <Picker.Item label="20% off" value={20} />
                    <Picker.Item label="30% off" value={30} />
                    <Picker.Item label="40% off" value={40} />
                    <Picker.Item label="50% off" value={50} />
                  </Picker>
                </View>
              </View>

              <View style={styles.valueFilter}>
                <Text style={styles.pickerLabel}>Maximum Price</Text>
                <View style={styles.nativePicker}>
                  <Picker
                    selectedValue={preferences.max_price}
                    onValueChange={handleMaxPriceChange}
                    style={styles.picker}
                    dropdownIconColor={theme.colors.foreground}
                    mode="dropdown"
                  >
                    <Picker.Item label="Any price" value={99999} />
                    <Picker.Item label="Under $25" value={25} />
                    <Picker.Item label="Under $50" value={50} />
                    <Picker.Item label="Under $100" value={100} />
                    <Picker.Item label="Under $200" value={200} />
                    <Picker.Item label="Under $500" value={500} />
                  </Picker>
                </View>
              </View>
            </View>
          </View>

          {/* Test Button */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.testButton} onPress={sendTestAlert}>
              <Text style={styles.testButtonText}>🔔 Send Test Alert</Text>
            </TouchableOpacity>
            <Text style={styles.testSubtext}>
              Test if your deal alerts are working
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    textAlign: 'center',
    color: theme.colors.mutedForeground,
    fontSize: theme.fontSize.md,
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    color: theme.colors.destructive,
    fontSize: theme.fontSize.md,
    marginTop: 50,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.md,
  },
  mainToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  toggleTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.foreground,
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.foreground,
    fontWeight: theme.fontWeight.medium,
  },
  settingSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  pickerSection: {
    marginTop: theme.spacing.md,
  },
  pickerLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.foreground,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  nativePicker: {
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.foreground,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  picker: {
    height: 50,
    color: theme.colors.foreground,
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  addButton: {
    backgroundColor: theme.colors.foreground,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    height: 50,
    justifyContent: 'center',
  },
  addButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  selectedItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.foreground,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  selectedItemText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.background,
  },
  removeIcon: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.background,
    fontWeight: theme.fontWeight.bold,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontStyle: 'italic',
  },
  valueFilters: {
    gap: theme.spacing.md,
  },
  valueFilter: {
    // Individual value filter styling if needed
  },
  testButton: {
    backgroundColor: theme.colors.foreground,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  testButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  testSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
  },
});
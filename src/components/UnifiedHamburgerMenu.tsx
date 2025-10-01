import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { theme } from '../utils/theme';
import { FilterState } from '../types';
import { LocationService } from '../services/location';
import { CANADIAN_REGIONS, STORES_BY_REGION, CATEGORIES } from '../data/filterData';

interface UnifiedHamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
  user: any;
  onSignOut: () => void;
  navigation: any;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.85;

export const UnifiedHamburgerMenu: React.FC<UnifiedHamburgerMenuProps> = ({
  visible,
  onClose,
  user,
  onSignOut,
  navigation,
  filters,
  onFiltersChange,
}) => {
  const [slideAnim] = useState(new Animated.Value(-MENU_WIDTH));
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -MENU_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleSourceChange = (source: string) => {
    onFiltersChange({ ...filters, source: source as 'all' | 'flipp' | 'community' | 'online' });
  };

  const handleRegionChange = (region: string) => {
    onFiltersChange({ ...filters, region });
  };

  const toggleCategory = (category: string) => {
    const updatedCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: updatedCategories });
  };

  const toggleStore = (store: string) => {
    const updatedStores = filters.stores.includes(store)
      ? filters.stores.filter(s => s !== store)
      : [...filters.stores, store];
    onFiltersChange({ ...filters, stores: updatedStores });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      stores: [],
      priceRange: [0, 2000],
      source: 'all',
      region: undefined,
    });
  };

  const toggleGeolocation = async (value: boolean) => {
    setGeolocationEnabled(value);
    if (value) {
      const hasPermission = await LocationService.requestLocationPermission();
      if (!hasPermission) {
        setGeolocationEnabled(false);
      }
    }
  };

  const userPoints = user?.user_metadata?.points || 0;
  const userLevel = Math.floor(userPoints / 100) + 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View
          style={[
            styles.menu,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.email?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <Text style={styles.userName}>{user?.email || 'Guest'}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userPoints}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>Lvl {userLevel}</Text>
                  <Text style={styles.statLabel}>Level</Text>
                </View>
              </View>
            </View>

            {/* Filters Section */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setFiltersExpanded(!filtersExpanded)}
              >
                <Text style={styles.sectionTitle}>Filters</Text>
                <Text style={styles.expandIcon}>{filtersExpanded ? '−' : '+'}</Text>
              </TouchableOpacity>

              {filtersExpanded && (
                <View style={styles.filterContent}>
                  {/* Source Selector */}
                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Sources</Text>
                    <View style={styles.sourceButtons}>
                      {['all', 'flipp', 'community', 'online'].map((source) => (
                        <TouchableOpacity
                          key={source}
                          style={[
                            styles.sourceButton,
                            filters.source === source && styles.sourceButtonActive,
                          ]}
                          onPress={() => handleSourceChange(source)}
                        >
                          <Text
                            style={[
                              styles.sourceButtonText,
                              filters.source === source && styles.sourceButtonTextActive,
                            ]}
                          >
                            {source === 'all' ? 'All' :
                             source === 'flipp' ? 'Flyers' :
                             source === 'community' ? 'Community' : 'Online'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Region Selector */}
                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Region</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.pillContainer}>
                        {Object.keys(CANADIAN_REGIONS).map((region) => (
                          <TouchableOpacity
                            key={region}
                            style={[
                              styles.pill,
                              filters.region === region && styles.pillActive,
                            ]}
                            onPress={() => handleRegionChange(region)}
                          >
                            <Text
                              style={[
                                styles.pillText,
                                filters.region === region && styles.pillTextActive,
                              ]}
                            >
                              {CANADIAN_REGIONS[region]}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Categories */}
                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Categories</Text>
                    <View style={styles.pillGrid}>
                      {CATEGORIES.map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={[
                            styles.pill,
                            filters.categories.includes(category) && styles.pillActive,
                          ]}
                          onPress={() => toggleCategory(category)}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              filters.categories.includes(category) && styles.pillTextActive,
                            ]}
                          >
                            {category}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Stores */}
                  {filters.region && (
                    <View style={styles.filterGroup}>
                      <Text style={styles.filterLabel}>Stores</Text>
                      <View style={styles.pillGrid}>
                        {STORES_BY_REGION[filters.region]?.map((store) => (
                          <TouchableOpacity
                            key={store}
                            style={[
                              styles.pill,
                              filters.stores.includes(store) && styles.pillActive,
                            ]}
                            onPress={() => toggleStore(store)}
                          >
                            <Text
                              style={[
                                styles.pillText,
                                filters.stores.includes(store) && styles.pillTextActive,
                              ]}
                            >
                              {store}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Clear Filters */}
                  {(filters.categories.length > 0 || filters.stores.length > 0 ||
                    filters.source !== 'all' || filters.region) && (
                    <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
                      <Text style={styles.clearButtonText}>Clear All Filters</Text>
                    </TouchableOpacity>
                  )}

                  {/* Notifications Toggle */}
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>
                      Enable notifications (based on filters)
                    </Text>
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                      trackColor={{ false: theme.colors.border, true: theme.colors.foreground }}
                      thumbColor={theme.colors.background}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomSection}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Use my location</Text>
                <Switch
                  value={geolocationEnabled}
                  onValueChange={toggleGeolocation}
                  trackColor={{ false: theme.colors.border, true: theme.colors.foreground }}
                  thumbColor={theme.colors.background}
                />
              </View>

              <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.foreground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    color: theme.colors.background,
    fontWeight: theme.fontWeight.bold,
  },
  userName: {
    fontSize: 18,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.foreground,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.foreground,
  },
  expandIcon: {
    fontSize: 24,
    color: theme.colors.mutedForeground,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.mutedForeground,
    marginBottom: 10,
  },
  sourceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sourceButton: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  sourceButtonActive: {
    backgroundColor: theme.colors.foreground,
    borderColor: theme.colors.foreground,
  },
  sourceButtonText: {
    fontSize: 12,
    color: theme.colors.foreground,
    fontWeight: theme.fontWeight.medium,
  },
  sourceButtonTextActive: {
    color: theme.colors.background,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillActive: {
    backgroundColor: theme.colors.foreground,
    borderColor: theme.colors.foreground,
  },
  pillText: {
    fontSize: 12,
    color: theme.colors.foreground,
  },
  pillTextActive: {
    color: theme.colors.background,
  },
  clearButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: theme.colors.foreground,
    fontWeight: theme.fontWeight.medium,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleLabel: {
    fontSize: 14,
    color: theme.colors.foreground,
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 'auto',
  },
  signOutButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.destructive,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { theme } from '../utils/theme';
import { FilterState } from '../types';
import { DEAL_CATEGORIES } from '../data/canadianData';

interface CompactFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const CompactFilter: React.FC<CompactFilterProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [activeFilterType, setActiveFilterType] = useState<'source' | 'category' | 'store'>('source');

  const sourceOptions = [
    { id: 'all', label: 'All', count: null },
    { id: 'flipp', label: 'Flyer', count: null },
    { id: 'community', label: 'Community', count: null },
    { id: 'online', label: 'Online', count: null }, // This will be affiliate deals
  ];

  const popularCategories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Health & Beauty',
    'Groceries',
    'Sports & Outdoors',
  ];

  const popularStores = [
    'Amazon',
    'Walmart',
    'Canadian Tire',
    'Loblaws',
    'Best Buy',
    'Lululemon',
    'Gap',
    'Roxy',
  ];

  const handleSourceFilter = (source: string) => {
    onFiltersChange({
      ...filters,
      source: source === 'all' ? 'all' : source,
    });
  };

  const handleCategoryFilter = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];

    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handleStoreFilter = (store: string) => {
    const newStores = filters.stores.includes(store)
      ? filters.stores.filter(s => s !== store)
      : [...filters.stores, store];

    onFiltersChange({
      ...filters,
      stores: newStores,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      stores: [],
      priceRange: [0, 2000],
      source: 'all',
    });
  };

  const hasActiveFilters =
    filters.source !== 'all' ||
    filters.categories.length > 0 ||
    filters.stores.length > 0;

  return (
    <View style={styles.container}>
      {/* Filter Type Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <TouchableOpacity
            style={[styles.tab, activeFilterType === 'source' && styles.activeTab]}
            onPress={() => setActiveFilterType('source')}
          >
            <Text style={[styles.tabText, activeFilterType === 'source' && styles.activeTabText]}>
              Source
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeFilterType === 'category' && styles.activeTab]}
            onPress={() => setActiveFilterType('category')}
          >
            <Text style={[styles.tabText, activeFilterType === 'category' && styles.activeTabText]}>
              Category
            </Text>
            {filters.categories.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{filters.categories.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeFilterType === 'store' && styles.activeTab]}
            onPress={() => setActiveFilterType('store')}
          >
            <Text style={[styles.tabText, activeFilterType === 'store' && styles.activeTabText]}>
              Store
            </Text>
            {filters.stores.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{filters.stores.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Filter Options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
        {activeFilterType === 'source' && (
          <View style={styles.optionsContainer}>
            {sourceOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.chip,
                  filters.source === option.id && styles.activeChip
                ]}
                onPress={() => handleSourceFilter(option.id)}
              >
                <Text style={[
                  styles.chipText,
                  filters.source === option.id && styles.activeChipText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeFilterType === 'category' && (
          <View style={styles.optionsContainer}>
            {popularCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.chip,
                  filters.categories.includes(category) && styles.activeChip
                ]}
                onPress={() => handleCategoryFilter(category)}
              >
                <Text style={[
                  styles.chipText,
                  filters.categories.includes(category) && styles.activeChipText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeFilterType === 'store' && (
          <View style={styles.optionsContainer}>
            {popularStores.map((store) => (
              <TouchableOpacity
                key={store}
                style={[
                  styles.chip,
                  filters.stores.includes(store) && styles.activeChip
                ]}
                onPress={() => handleStoreFilter(store)}
              >
                <Text style={[
                  styles.chipText,
                  filters.stores.includes(store) && styles.activeChipText
                ]}>
                  {store}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
  },
  tabContainer: {
    marginBottom: theme.spacing.sm,
  },
  tabScroll: {
    paddingHorizontal: theme.spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.muted,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.mutedForeground,
  },
  activeTabText: {
    color: theme.colors.primaryForeground,
  },
  badge: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
  },
  clearButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginLeft: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.foreground,
  },
  optionsScroll: {
    paddingHorizontal: theme.spacing.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.muted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.mutedForeground,
  },
  activeChipText: {
    color: theme.colors.primaryForeground,
  },
});
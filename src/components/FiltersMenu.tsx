import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../utils/theme';
import { FilterState } from '../types';

interface FiltersMenuProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const FiltersMenu: React.FC<FiltersMenuProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
}) => {
  const { width } = Dimensions.get('window');
  const isNarrowScreen = width < 380; // Pixel 7 Pro and similar
  const categories = [
    'Electronics',
    'Groceries',
    'Clothing',
    'Home & Garden',
    'Health & Beauty',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Automotive',
    'Food & Beverages',
  ];

  const stores = [
    'Walmart',
    'Target',
    'Best Buy',
    'Amazon',
    'Costco',
    'Home Depot',
    'Loblaws',
    'Metro',
    'Sobeys',
    'Canadian Tire',
    'Shoppers Drug Mart',
    'London Drugs',
    'Save-on-Foods',
    'Thrifty Foods',
    'Rona',
  ];

  const handleCategoryAdd = (category: string) => {
    if (category && !filters.categories.includes(category)) {
      onFiltersChange({
        ...filters,
        categories: [...filters.categories, category],
      });
    }
  };

  const handleStoreAdd = (store: string) => {
    if (store && !filters.stores.includes(store)) {
      onFiltersChange({
        ...filters,
        stores: [...filters.stores, store],
      });
    }
  };

  const handleCategoryRemove = (category: string) => {
    onFiltersChange({
      ...filters,
      categories: filters.categories.filter(c => c !== category),
    });
  };

  const handleStoreRemove = (store: string) => {
    onFiltersChange({
      ...filters,
      stores: filters.stores.filter(s => s !== store),
    });
  };

  const handleSourceChange = (source: 'all' | 'community' | 'flipp') => {
    onFiltersChange({
      ...filters,
      source,
    });
  };

  const handlePriceRangeChange = (range: 'low' | 'medium' | 'high' | 'all') => {
    const priceRanges = {
      all: [0, 2000],
      low: [0, 50],
      medium: [51, 200],
      high: [201, 2000],
    };

    onFiltersChange({
      ...filters,
      priceRange: priceRanges[range] as [number, number],
    });
  };

  const getCurrentPriceRange = () => {
    const [min, max] = filters.priceRange;
    if (min === 0 && max >= 2000) return 'all';
    if (min === 0 && max <= 50) return 'low';
    if (min === 51 && max <= 200) return 'medium';
    if (min === 201 && max >= 2000) return 'high';
    return 'all';
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      stores: [],
      priceRange: [0, 2000],
      source: 'all',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isNarrowScreen && styles.headerNarrow]}>
          <Text style={[styles.headerTitle, isNarrowScreen && styles.headerTitleNarrow]}>Filters</Text>
          <View style={[styles.headerButtons, isNarrowScreen && styles.headerButtonsNarrow]}>
            <TouchableOpacity style={[styles.clearButton, isNarrowScreen && styles.clearButtonNarrow]} onPress={clearAllFilters}>
              <Text style={[styles.clearButtonText, isNarrowScreen && styles.clearButtonTextNarrow]}>
                {isNarrowScreen ? 'Clear' : 'Clear All'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.closeButton, isNarrowScreen && styles.closeButtonNarrow]} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Source Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Source</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.source}
                onValueChange={handleSourceChange}
                style={styles.picker}
                dropdownIconColor={theme.colors.foreground}
              >
                <Picker.Item label="All Sources" value="all" />
                <Picker.Item label="Community" value="community" />
                <Picker.Item label="Retailer" value="flipp" />
              </Picker>
            </View>
          </View>

          {/* Categories Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue=""
                onValueChange={handleCategoryAdd}
                style={styles.picker}
                dropdownIconColor={theme.colors.foreground}
              >
                <Picker.Item label="Select Category..." value="" />
                {categories.map(category => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>
            <View style={styles.selectedItemsContainer}>
              {filters.categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.selectedItem}
                  onPress={() => handleCategoryRemove(category)}
                >
                  <Text style={styles.selectedItemText}>{category}</Text>
                  <Text style={styles.removeIcon}>×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stores Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stores</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue=""
                onValueChange={handleStoreAdd}
                style={styles.picker}
                dropdownIconColor={theme.colors.foreground}
              >
                <Picker.Item label="Select Store..." value="" />
                {stores.map(store => (
                  <Picker.Item key={store} label={store} value={store} />
                ))}
              </Picker>
            </View>
            <View style={styles.selectedItemsContainer}>
              {filters.stores.map((store) => (
                <TouchableOpacity
                  key={store}
                  style={styles.selectedItem}
                  onPress={() => handleStoreRemove(store)}
                >
                  <Text style={styles.selectedItemText}>{store}</Text>
                  <Text style={styles.removeIcon}>×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={getCurrentPriceRange()}
                onValueChange={handlePriceRangeChange}
                style={styles.picker}
                dropdownIconColor={theme.colors.foreground}
              >
                <Picker.Item label="All Prices" value="all" />
                <Picker.Item label="$0 - $50" value="low" />
                <Picker.Item label="$51 - $200" value="medium" />
                <Picker.Item label="$201+" value="high" />
              </Picker>
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    minHeight: 60,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexShrink: 0,
  },
  clearButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.foreground,
    minWidth: 60,
  },
  clearButtonText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.foreground,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.foreground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.colors.foreground,
    fontWeight: theme.fontWeight.bold,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  pickerContainer: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  picker: {
    height: 50,
    color: theme.colors.foreground,
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
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
    fontSize: theme.fontSize.sm,
    color: theme.colors.background,
  },
  removeIcon: {
    fontSize: theme.fontSize.md,
    color: theme.colors.background,
    fontWeight: theme.fontWeight.bold,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  applyButton: {
    backgroundColor: theme.colors.foreground,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  applyButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  // Narrow screen adjustments
  headerNarrow: {
    paddingHorizontal: theme.spacing.sm,
  },
  headerTitleNarrow: {
    fontSize: theme.fontSize.md,
  },
  headerButtonsNarrow: {
    gap: theme.spacing.xs,
  },
  clearButtonNarrow: {
    paddingHorizontal: theme.spacing.xs,
    minWidth: 45,
  },
  clearButtonTextNarrow: {
    fontSize: 10,
  },
  closeButtonNarrow: {
    width: 24,
    height: 24,
  },
});
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Deal, User, FilterState } from '../types';
import { DealCard } from '../components/DealCard';
import { HamburgerMenu } from '../components/HamburgerMenu';
import { FiltersMenu } from '../components/FiltersMenu';
import { CompactFilter } from '../components/CompactFilter';
import { AdBar } from '../components/AdBar';
import { theme } from '../utils/theme';
import { supabase } from '../services/supabase';
import { fetchFlippDeals } from '../services/api';
import { LocationService } from '../services/location';
import { getRandomAffiliateDeals, getDynamicAffiliateDeals } from '../data/affiliateDeals';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreDeals, setHasMoreDeals] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    stores: [],
    priceRange: [0, 2000],
    source: 'all',
  });

  useEffect(() => {
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialDeals();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    applyFilters();
  }, [deals, searchQuery, filters]);

  const getUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('HomeScreen getUser result:', { userId: user?.id, email: user?.email, error });
      setUser(user);
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

  const fetchCommunityDeals = async (): Promise<Deal[]> => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching deals:', error);
        return [];
      }


      return data?.map((deal) => ({
        id: deal.id,
        title: deal.title,
        description: deal.description,
        price: deal.price,
        original_price: deal.original_price,
        discount_percentage: deal.discount_percentage,
        store: deal.store,
        category: deal.category,
        image_url: deal.image_url,
        deal_url: deal.deal_url,
        expiry_date: deal.expiry_date,
        source: 'community' as const,
        upvotes: deal.upvotes || 0,
        downvotes: deal.downvotes || 0,
        score: deal.score || 0,
        submitted_by: deal.submitted_by,
      })) || [];
    } catch (error) {
      console.error('Error fetching community deals:', error);
      return [];
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadInitialDeals = async () => {
    setIsLoading(true);
    try {
      const [communityDeals, flippDeals] = await Promise.all([
        fetchCommunityDeals(),
        fetchFlippDeals({ query: 'sale', limit: 50, page: 1 }),
      ]);

      // Get dynamic affiliate deals - ensure we always get some
      const affiliateDeals = getDynamicAffiliateDeals();
      console.log('Affiliate deals loaded:', affiliateDeals.length);

      // Combine all deals and shuffle
      const allRealDeals = [...communityDeals, ...flippDeals];
      const mixedDeals: Deal[] = [];

      // Always add at least 1 affiliate deal early in the feed
      if (affiliateDeals.length > 0) {
        // Add first 2-3 real deals
        for (let i = 0; i < Math.min(3, allRealDeals.length); i++) {
          mixedDeals.push(allRealDeals[i]);
        }

        // Add first affiliate deal
        mixedDeals.push(affiliateDeals[0]);

        // Continue with strategic mixing for remaining deals
        let realIndex = 3;
        let affiliateIndex = 1;
        let dealsUntilAffiliate = Math.floor(Math.random() * 3) + 4; // 4-6 deals before next affiliate

        while (realIndex < allRealDeals.length || affiliateIndex < affiliateDeals.length) {
          if (dealsUntilAffiliate > 0 && realIndex < allRealDeals.length) {
            mixedDeals.push(allRealDeals[realIndex]);
            realIndex++;
            dealsUntilAffiliate--;
          } else if (affiliateIndex < affiliateDeals.length) {
            mixedDeals.push(affiliateDeals[affiliateIndex]);
            affiliateIndex++;
            dealsUntilAffiliate = Math.floor(Math.random() * 3) + 4; // 4-6 deals before next affiliate
          } else {
            // Add remaining real deals
            mixedDeals.push(allRealDeals[realIndex]);
            realIndex++;
          }
        }
      } else {
        // No affiliate deals, just use real deals
        mixedDeals.push(...allRealDeals);
      }

      console.log('Total mixed deals:', mixedDeals.length, 'Affiliate deals:', affiliateDeals.length);
      setDeals(mixedDeals);
      setHasMoreDeals(true);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading initial deals:', error);
      Alert.alert('Error', 'Failed to load deals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreDeals = async () => {
    if (isLoadingMore || !hasMoreDeals || searchQuery.trim()) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const categories = ['grocery', 'electronics', 'clothing', 'home', 'health', 'beauty'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      const moreDeals = await fetchFlippDeals({
        query: randomCategory,
        limit: 20,
        page: nextPage,
      });

      if (moreDeals.length > 0) {
        const shuffledMore = shuffleArray(moreDeals);
        setDeals((prevDeals) => [...prevDeals, ...shuffledMore]);
        setCurrentPage(nextPage);
        setHasMoreDeals(moreDeals.length >= 20);
      } else {
        setHasMoreDeals(false);
      }
    } catch (error) {
      console.error('Error loading more deals:', error);
      setHasMoreDeals(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const applyFilters = () => {
    let filtered = deals;

    // Apply search filter
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (deal) =>
          deal.title.toLowerCase().includes(searchTerm) ||
          deal.store.toLowerCase().includes(searchTerm) ||
          deal.category?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply other filters
    if (filters.source !== 'all') {
      if (filters.source === 'online') {
        // Filter for affiliate deals (disguised as community but with specific IDs)
        filtered = filtered.filter((deal) =>
          deal.source === 'community' && deal.id.startsWith('aff-')
        );
      } else if (filters.source === 'flipp') {
        // Filter for Flipp deals
        filtered = filtered.filter((deal) => deal.source === 'flipp');
      } else if (filters.source === 'community') {
        // Filter for real community deals (not affiliate)
        filtered = filtered.filter((deal) =>
          deal.source === 'community' && !deal.id.startsWith('aff-')
        );
      } else {
        filtered = filtered.filter((deal) => deal.source === filters.source);
      }
    }

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(
        (deal) => deal.category && filters.categories.includes(deal.category)
      );
    }

    if (filters.stores && filters.stores.length > 0) {
      filtered = filtered.filter((deal) => filters.stores.includes(deal.store));
    }

    filtered = filtered.filter((deal) => {
      if (!deal.price) return true;
      const minPrice = filters.priceRange?.[0] ?? 0;
      const maxPrice = filters.priceRange?.[1] ?? 1000;
      return deal.price >= minPrice && deal.price <= maxPrice;
    });

    setFilteredDeals(filtered);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialDeals();
    setIsRefreshing(false);
  };

  const handleAuth = () => {
    navigation.navigate('Auth');
  };

  const handleShareDeal = () => {
    navigation.navigate('SnapDeal');
  };

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsMenuVisible(false);
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleFilterByStore = (store: string) => {
    setFilters({
      ...filters,
      stores: [store],
    });
  };

  const renderDealCard = ({ item }: { item: Deal }) => (
    <View style={styles.dealCardContainer}>
      <DealCard
        deal={item}
        currentUserId={user?.id}
        onFilterByStore={handleFilterByStore}
      />
    </View>
  );

  const renderFooter = () => {
    if (!hasMoreDeals || searchQuery.trim()) return null;

    return (
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={loadMoreDeals}
          disabled={isLoadingMore}
        >
          <Text style={styles.loadMoreText}>
            {isLoadingMore ? 'Loading more deals...' : 'Find More Deals'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery
          ? `No deals found for "${searchQuery}"`
          : 'No deals shared yet - be the first to share a great deal!'}
      </Text>
      <TouchableOpacity style={styles.snapButton} onPress={handleShareDeal}>
        <Text style={styles.snapButtonText}>Share Your First Deal</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>●</Text>
          <Text style={styles.appTitle}>FindersKeepers</Text>
        </View>
        <Text style={styles.authSubtitle}>Find and keep the best deals around you</Text>
        <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
          <Text style={styles.authButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Sticky Header */}
      <View style={styles.stickyHeader}>
        <View style={styles.headerRow}>
          {/* Compact Logo */}
          <View style={styles.compactLogo}>
            <Text style={styles.compactLogoIcon}>●</Text>
          </View>

          {/* Smart Search Bar */}
          <View style={styles.smartSearchContainer}>
            <TextInput
              style={styles.smartSearchInput}
              placeholder="Search deals..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.colors.mutedForeground}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareDeal}
            >
              <Text style={styles.shareButtonIcon}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.hamburgerButton}
              onPress={handleMenuPress}
            >
              <View style={styles.hamburgerIcon}>
                <View style={styles.hamburgerLine} />
                <View style={styles.hamburgerLine} />
                <View style={styles.hamburgerLine} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Compact Filter Bar */}
      <CompactFilter
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Content */}
      <FlatList
        data={filteredDeals}
        renderItem={renderDealCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMoreDeals}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={!isLoading ? renderEmptyComponent : null}
        showsVerticalScrollIndicator={false}
      />

      <HamburgerMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        user={user}
        onSignOut={handleSignOut}
        navigation={navigation}
      />

      {/* Monetization Ad Bar */}
      <AdBar position="bottom" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  authContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logo: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoText: {
    fontSize: 60,
    marginBottom: theme.spacing.sm,
  },
  appTitle: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
  },
  authSubtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  authButton: {
    backgroundColor: theme.colors.foreground,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  authButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  stickyHeader: {
    backgroundColor: theme.colors.background,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    gap: 12,
  },
  compactLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  compactLogoIcon: {
    fontSize: 20,
    color: '#fff',
  },
  smartSearchContainer: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.input,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  smartSearchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.foreground,
    paddingVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  shareButtonIcon: {
    fontSize: 20,
    color: '#000',
  },
  hamburgerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  hamburgerIcon: {
    width: 18,
    height: 14,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 18,
    height: 2,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 60, // Add space for ad bar
  },
  row: {
    justifyContent: 'space-between',
  },
  dealCardContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  loadMoreButton: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.foreground,
  },
  loadMoreText: {
    color: theme.colors.foreground,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  snapButton: {
    backgroundColor: theme.colors.foreground,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  snapButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});
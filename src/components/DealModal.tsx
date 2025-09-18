import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { Deal } from '../types';
import { theme } from '../utils/theme';
import { locationService } from '../services/location';

interface DealModalProps {
  isVisible: boolean;
  onClose: () => void;
  deal: Deal | null;
  currentUserId?: string;
  onFilterByStore?: (store: string) => void;
}

const { height: screenHeight } = Dimensions.get('window');

export const DealModal: React.FC<DealModalProps> = ({
  isVisible,
  onClose,
  deal,
  currentUserId,
  onFilterByStore,
}) => {
  if (!deal) return null;

  const handleViewDeal = () => {
    if (deal.deal_url && typeof deal.deal_url === 'string') {
      Linking.openURL(deal.deal_url);
    }
  };

  const handleStorePress = () => {
    if (onFilterByStore && safeStore) {
      onFilterByStore(safeStore);
      onClose();
    }
  };

  const handleFindStore = async () => {
    try {
      // Get user's current location
      const location = await locationService.getCurrentPosition();

      // Create Google Maps search URL for nearest store
      const storeName = encodeURIComponent(deal.store || 'Store');
      const mapsUrl = Platform.select({
        ios: `maps://maps.google.com/maps?q=${storeName}&near=${location.coords.latitude},${location.coords.longitude}`,
        android: `geo:${location.coords.latitude},${location.coords.longitude}?q=${storeName}`,
        default: `https://www.google.com/maps/search/${storeName}/@${location.coords.latitude},${location.coords.longitude},14z`,
      });

      Linking.openURL(mapsUrl as string);
    } catch (error) {
      // If location permission denied, search without coordinates
      const storeName = encodeURIComponent(deal.store || 'Store');
      const mapsUrl = `https://www.google.com/maps/search/${storeName}`;
      Linking.openURL(mapsUrl);
    }
  };

  const safeTitle = String(deal.title || 'Product');
  const safeDescription = String(deal.description || '');
  const safeStore = String(deal.store || 'Store');
  const safeCategory = String(deal.category || '');
  const safePrice = typeof deal.price === 'number' ? deal.price : 0;
  const safeOriginalPrice = typeof deal.original_price === 'number' ? deal.original_price : 0;
  const safeDiscount = typeof deal.discount_percentage === 'number' ? deal.discount_percentage : 0;
  const savings = safeOriginalPrice - safePrice;

  // For Flipp deals, extract price range from description if no price is set
  const extractPriceRange = (text: string) => {
    const priceRangeMatch = text.match(/\$?(\d+\.?\d*)\s*[-–]\s*\$?(\d+\.?\d*)/);
    return priceRangeMatch ? `$${priceRangeMatch[1]} - $${priceRangeMatch[2]}` : null;
  };

  const priceRange = (safePrice === 0 && safeDescription) ?
    extractPriceRange(safeDescription) || extractPriceRange(safeTitle) : null;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      propagateSwipe={true}
      avoidKeyboard={true}
      statusBarTranslucent
    >
      <View style={styles.modalContent}>
        {/* Swipe indicator */}
        <View style={styles.swipeIndicator} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Image Section */}
          {deal.image_url && typeof deal.image_url === 'string' && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: deal.image_url }}
                style={styles.image}
                resizeMode="contain"
              />
              {safeDiscount > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {String(safeDiscount)}% OFF
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Content Section */}
          <View style={styles.content}>
            {/* Header with source badge */}
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={3}>
                {safeTitle}
              </Text>
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceText}>
                  {deal.source === 'community' ? 'Community' : 'Flipp'}
                </Text>
              </View>
            </View>

            {/* Description */}
            {safeDescription && (
              <Text style={styles.description}>
                {safeDescription}
              </Text>
            )}

            {/* Price Section */}
            <View style={styles.priceSection}>
              <View style={styles.priceRow}>
                {priceRange ? (
                  <Text style={styles.currentPrice}>{priceRange}</Text>
                ) : safePrice > 0 ? (
                  <>
                    <Text style={styles.currentPrice}>${safePrice.toFixed(2)}</Text>
                    {safeOriginalPrice > safePrice && (
                      <>
                        <Text style={styles.originalPrice}>
                          ${safeOriginalPrice.toFixed(2)}
                        </Text>
                        <View style={styles.savingsBadge}>
                          <Text style={styles.savingsText}>
                            Save ${savings.toFixed(2)}
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                ) : (
                  <Text style={styles.currentPrice}>Price Available In Store</Text>
                )}
              </View>
            </View>

            {/* Store Info Section */}
            <View style={styles.storeSection}>
              <TouchableOpacity
                style={styles.storeInfo}
                onPress={handleStorePress}
                activeOpacity={0.7}
              >
                <Text style={styles.storeLabel}>Available at</Text>
                <View style={styles.storeNameContainer}>
                  <Text style={styles.storeName}>{safeStore}</Text>
                  <Text style={styles.filterIcon}>🔍</Text>
                </View>
                {safeCategory && (
                  <Text style={styles.categoryText}>{safeCategory}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mapButton}
                onPress={handleFindStore}
                activeOpacity={0.8}
              >
                <Text style={styles.mapIcon}>📍</Text>
                <Text style={styles.mapButtonText}>Find Store</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              {deal.deal_url && (
                <TouchableOpacity
                  style={styles.viewDealButton}
                  onPress={handleViewDeal}
                  activeOpacity={0.9}
                >
                  <Text style={styles.viewDealButtonText}>View Deal</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.9}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            {/* Deal metadata */}
            {deal.created_at && (
              <View style={styles.metadata}>
                <Text style={styles.metadataText}>
                  Posted {new Date(deal.created_at).toLocaleDateString()}
                </Text>
                {deal.source === 'community' && deal.upvotes !== undefined && (
                  <Text style={styles.metadataText}>
                    {deal.upvotes} upvotes
                  </Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: screenHeight * 0.85,
    minHeight: screenHeight * 0.5,
  },
  swipeIndicator: {
    width: 36,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.foreground,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  discountText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  title: {
    flex: 1,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
    marginRight: theme.spacing.sm,
  },
  sourceBadge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.foreground,
  },
  sourceText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.foreground,
    fontWeight: theme.fontWeight.medium,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.mutedForeground,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  priceSection: {
    marginBottom: theme.spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
  },
  originalPrice: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.mutedForeground,
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: theme.colors.foreground,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  savingsText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  storeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  storeInfo: {
    flex: 1,
  },
  storeLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedForeground,
    marginBottom: 2,
  },
  storeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
    textDecorationLine: 'underline',
  },
  filterIcon: {
    fontSize: theme.fontSize.sm,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mapIcon: {
    fontSize: theme.fontSize.lg,
    marginRight: theme.spacing.xs,
  },
  mapButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.foreground,
  },
  actions: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  viewDealButton: {
    backgroundColor: theme.colors.foreground,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  viewDealButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  closeButton: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  closeButtonText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
  },
  metadataText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedForeground,
  },
});
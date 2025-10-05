import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Deal } from '../types';
import { theme } from '../utils/theme';
import { DealModal } from './DealModal';

interface DealCardProps {
  deal: Deal;
  currentUserId?: string;
  onFilterByStore?: (store: string) => void;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, currentUserId, onFilterByStore }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Safety check for deal data
  if (!deal || typeof deal !== 'object') {
    return (
      <View style={styles.card}>
        <View style={styles.content}>
          <Text style={styles.title}>Error</Text>
          <Text style={styles.description}>Invalid deal data</Text>
        </View>
      </View>
    );
  }

  const handleViewDeal = () => {
    if (deal.deal_url && typeof deal.deal_url === 'string') {
      Linking.openURL(deal.deal_url);
    }
  };

  const handleCardPress = () => {
    setIsModalVisible(true);
  };

  const safeTitle = String(deal.title || 'Product');
  const safeDescription = String(deal.description || '');
  const safeStore = String(deal.store || 'Store');
  const safeCategory = String(deal.category || '');
  const safePrice = typeof deal.price === 'number' ? deal.price : 0;
  const safeOriginalPrice = typeof deal.original_price === 'number' ? deal.original_price : 0;
  const safeDiscount = typeof deal.discount_percentage === 'number' ? deal.discount_percentage : 0;

  // For Flipp deals, extract price range from description if no price is set
  const extractPriceRange = (text: string) => {
    const priceRangeMatch = text.match(/\$?(\d+\.?\d*)\s*[-–]\s*\$?(\d+\.?\d*)/);
    return priceRangeMatch ? `$${priceRangeMatch[1]}-$${priceRangeMatch[2]}` : null;
  };

  const priceRange = (safePrice === 0 && safeDescription) ?
    extractPriceRange(safeDescription) || extractPriceRange(safeTitle) : null;

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={handleCardPress} activeOpacity={0.95}>
      <View style={styles.imageContainer}>
        {deal.image_url && typeof deal.image_url === 'string' && deal.image_url.trim() !== '' ? (
          <Image
            source={{ uri: deal.image_url }}
            style={styles.image}
            resizeMode="contain"
            onError={(e) => {
              console.log('Image failed to load, length:', deal.image_url?.length, 'Error:', e.nativeEvent?.error);
            }}
            onLoad={() => {
              console.log('Image loaded successfully, is base64:', deal.image_url?.startsWith('data:image'));
            }}
          />
        ) : (
          <>
            {console.log('No image URL for deal:', deal.title, 'image_url:', deal.image_url, 'source:', deal.source)}
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>📦</Text>
              <Text style={styles.placeholderLabel}>Deal</Text>
            </View>
          </>
        )}
        {safeDiscount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {String(safeDiscount)}% OFF
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {safeTitle}
          </Text>
        </View>

        {safeDescription && (
          <Text style={styles.description} numberOfLines={2}>
            {safeDescription}
          </Text>
        )}

        <View style={styles.storeInfo}>
          <Text style={styles.storeText}>{safeStore}</Text>
          {safeCategory && (
            <Text style={styles.categoryText}> • {safeCategory}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            {priceRange ? (
              <Text style={styles.price}>{priceRange}</Text>
            ) : safePrice > 0 ? (
              <>
                <Text style={styles.price}>${safePrice.toFixed(2)}</Text>
                {safeOriginalPrice > safePrice && (
                  <Text style={styles.originalPrice}>
                    ${safeOriginalPrice.toFixed(2)}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.price}>In Store</Text>
            )}
          </View>

          {deal.deal_url && (
            <TouchableOpacity style={styles.viewButton} onPress={handleViewDeal}>
              <Text style={styles.viewButtonText}>View Deal</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      </TouchableOpacity>

      <DealModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        deal={deal}
        currentUserId={currentUserId}
        onFilterByStore={onFilterByStore}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: theme.colors.card,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.muted,
  },
  placeholderText: {
    fontSize: 32,
    marginBottom: 4,
  },
  placeholderLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontWeight: theme.fontWeight.medium,
  },
  discountBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.destructive,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  discountText: {
    color: theme.colors.card,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.cardForeground,
    marginRight: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  storeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedForeground,
  },
  categoryText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedForeground,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
    marginRight: theme.spacing.sm,
  },
  originalPrice: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
    textDecorationLine: 'line-through',
  },
  viewButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  viewButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
});
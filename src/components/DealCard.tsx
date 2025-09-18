import React, { useState, useEffect } from 'react';
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
import { gamificationService } from '../services/gamification';
import { supabase } from '../services/supabase';
import { DealModal } from './DealModal';

interface DealCardProps {
  deal: Deal;
  currentUserId?: string;
  onFilterByStore?: (store: string) => void;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, currentUserId, onFilterByStore }) => {
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [voteCount, setVoteCount] = useState({
    upvotes: deal.upvotes || 0,
    downvotes: deal.downvotes || 0,
    score: deal.score || 0,
  });
  const [isVoting, setIsVoting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (currentUserId && deal.id) {
      loadUserVote();
    }
  }, [currentUserId, deal.id]);

  const loadUserVote = async () => {
    if (!currentUserId) return;
    try {
      const vote = await gamificationService.getUserVote(deal.id, currentUserId);
      setUserVote(vote);
    } catch (error) {
      console.error('Error loading user vote:', error);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!currentUserId || isVoting) return;

    setIsVoting(true);
    try {
      // Optimistic update
      const newUserVote = userVote === voteType ? null : voteType;
      setUserVote(newUserVote);

      let newUpvotes = voteCount.upvotes;
      let newDownvotes = voteCount.downvotes;

      // Remove previous vote
      if (userVote === 'upvote') newUpvotes--;
      if (userVote === 'downvote') newDownvotes--;

      // Add new vote
      if (newUserVote === 'upvote') newUpvotes++;
      if (newUserVote === 'downvote') newDownvotes++;

      setVoteCount({
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        score: newUpvotes - newDownvotes,
      });

      // Send to backend
      if (newUserVote) {
        await gamificationService.handleVote(
          deal.id,
          currentUserId,
          deal.submitted_by || '',
          newUserVote
        );
      }
    } catch (error) {
      console.error('Error voting:', error);
      // Revert optimistic update
      loadUserVote();
      setVoteCount({
        upvotes: deal.upvotes || 0,
        downvotes: deal.downvotes || 0,
        score: deal.score || 0,
      });
    } finally {
      setIsVoting(false);
    }
  };
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

          <View style={styles.actions}>
            {/* Voting buttons for community deals */}
            {deal.source === 'community' && currentUserId && (
              <View style={styles.voteContainer}>
                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    userVote === 'upvote' && styles.voteButtonActive,
                  ]}
                  onPress={() => handleVote('upvote')}
                  disabled={isVoting}
                >
                  <Text style={[
                    styles.voteText,
                    userVote === 'upvote' && styles.voteTextActive,
                  ]}>▲</Text>
                </TouchableOpacity>

                <Text style={styles.scoreText}>{voteCount.score}</Text>

                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    userVote === 'downvote' && styles.voteButtonActive,
                  ]}
                  onPress={() => handleVote('downvote')}
                  disabled={isVoting}
                >
                  <Text style={[
                    styles.voteText,
                    userVote === 'downvote' && styles.voteTextActive,
                  ]}>▼</Text>
                </TouchableOpacity>
              </View>
            )}

            {deal.deal_url && (
              <TouchableOpacity style={styles.viewButton} onPress={handleViewDeal}>
                <Text style={styles.viewButtonText}>View Deal</Text>
              </TouchableOpacity>
            )}
          </View>
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
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.foreground,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  discountText: {
    color: theme.colors.background,
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voteButtonActive: {
    backgroundColor: theme.colors.foreground,
    borderColor: theme.colors.foreground,
  },
  voteText: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    fontWeight: 'bold',
  },
  voteTextActive: {
    color: theme.colors.background,
  },
  scoreText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.foreground,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  viewButton: {
    backgroundColor: theme.colors.foreground,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  viewButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
});
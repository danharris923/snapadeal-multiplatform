import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { Deal } from '../types';
import { theme } from '../utils/theme';
import { locationService } from '../services/location';
import { gamificationService } from '../services/gamification';
import { contentModerationService } from '../services/contentModeration';

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
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [voteCount, setVoteCount] = useState({
    upvotes: deal?.upvotes || 0,
    downvotes: deal?.downvotes || 0,
    score: deal?.score || 0,
  });
  const [isVoting, setIsVoting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    if (currentUserId && deal?.id) {
      loadUserVote();
    }
    // Reset vote count when deal changes
    if (deal) {
      setVoteCount({
        upvotes: deal.upvotes || 0,
        downvotes: deal.downvotes || 0,
        score: deal.score || 0,
      });
    }
  }, [currentUserId, deal?.id]);

  const loadUserVote = async () => {
    if (!currentUserId || !deal) return;
    try {
      const vote = await gamificationService.getUserVote(deal.id, currentUserId);
      setUserVote(vote);
    } catch (error) {
      console.error('Error loading user vote:', error);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!currentUserId || isVoting || !deal) return;

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

  const handleReport = async () => {
    if (!currentUserId || isReporting || !deal) return;

    Alert.alert(
      'Report Deal',
      'Why are you reporting this deal?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Spam',
          onPress: () => submitReport('spam'),
        },
        {
          text: 'Scam/Fake',
          onPress: () => submitReport('scam'),
        },
        {
          text: 'Inappropriate',
          onPress: () => submitReport('inappropriate'),
        },
        {
          text: 'No Longer Available',
          onPress: () => submitReport('fake'),
        },
      ],
      { cancelable: true }
    );
  };

  const submitReport = async (reason: 'spam' | 'scam' | 'inappropriate' | 'fake' | 'other') => {
    if (!currentUserId || !deal) return;

    setIsReporting(true);
    try {
      const result = await contentModerationService.reportContent(
        deal.id,
        currentUserId,
        reason
      );

      if (result.success) {
        Alert.alert(
          'Thank You',
          'Your report has been submitted. Our team will review it shortly.'
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error reporting deal:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsReporting(false);
    }
  };

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

            {/* Voting and Reporting Section */}
            {deal.source === 'community' && currentUserId && (
              <View style={styles.engagementSection}>
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

                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{voteCount.score}</Text>
                </View>

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

                <TouchableOpacity
                  style={styles.reportButtonSmall}
                  onPress={handleReport}
                  disabled={isReporting}
                >
                  <Text style={styles.reportIconSmall}>⚠️</Text>
                </TouchableOpacity>
              </View>
            )}

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
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: screenHeight * 0.85,
    minHeight: screenHeight * 0.5,
    ...theme.shadows.lg,
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
    backgroundColor: theme.colors.card,
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
    backgroundColor: theme.colors.destructive,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  discountText: {
    color: theme.colors.card,
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
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sourceText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.secondaryForeground,
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
    backgroundColor: theme.colors.successGreen,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  savingsText: {
    color: theme.colors.card,
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
    backgroundColor: theme.colors.secondary,
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
  engagementSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.muted,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  voteButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voteButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  voteText: {
    fontSize: 16,
    color: theme.colors.mutedForeground,
    fontWeight: 'bold',
  },
  voteTextActive: {
    color: theme.colors.card,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
    minWidth: 40,
  },
  scoreText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
  },
  reportButtonSmall: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
  },
  reportIconSmall: {
    fontSize: 14,
  },
  actions: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  viewDealButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  viewDealButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  closeButton: {
    backgroundColor: theme.colors.secondary,
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
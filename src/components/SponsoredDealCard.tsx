import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { theme } from '../utils/theme';
import { trackAffiliateClick } from '../config/affiliateLinks';
import { DealModal } from './DealModal';
import { Deal } from '../types';

interface SponsoredDealCardProps {
  title: string;
  subtitle: string;
  discount: string;
  store: string;
  affiliateUrl: string;
  dealId: string;
  color?: string;
}

export const SponsoredDealCard: React.FC<SponsoredDealCardProps> = ({
  title,
  subtitle,
  discount,
  store,
  affiliateUrl,
  dealId,
  color = '#000',
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handlePress = () => {
    setIsModalVisible(true);
  };

  const handleViewDeal = () => {
    trackAffiliateClick(dealId, 'sponsored_card');
    Linking.openURL(affiliateUrl);
  };

  // Create a Deal object for the modal
  const modalDeal: Deal = {
    id: dealId,
    title,
    description: subtitle,
    store,
    price: 0, // Parse from discount string if needed
    original_price: 0,
    discount_percentage: parseInt(discount.replace(/\D/g, '')) || 0,
    deal_url: affiliateUrl,
    source: 'sponsored',
    category: '',
    created_at: new Date().toISOString(),
  };

  return (
    <>
      <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>FEATURED</Text>
        </View>
        <Text style={styles.store}>{store}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.discount}>{discount}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Shop Deal →</Text>
        </View>
      </View>
    </TouchableOpacity>

      <DealModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        deal={modalDeal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FAFAFA',
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.foreground,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  featuredBadge: {
    backgroundColor: theme.colors.foreground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredText: {
    color: theme.colors.background,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  store: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontWeight: '500',
  },
  content: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  discount: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  footer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.foreground,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
});
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Animated,
} from 'react-native';
import { theme } from '../utils/theme';
import { affiliateLinks, trackAffiliateClick, getRandomAdCopy } from '../config/affiliateLinks';

interface AdBarProps {
  position?: 'bottom' | 'top';
}

interface Ad {
  id: string;
  text: string;
  actionText: string;
  url: string;
  type: 'affiliate' | 'flyer' | 'premium' | 'cashback';
}

export const AdBar: React.FC<AdBarProps> = ({ position = 'bottom' }) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = useState(new Animated.Value(1))[0];

  // Your actual affiliate links with high-CTR copy
  const ads: Ad[] = [
    {
      id: 'amazon-deals',
      text: '🔥 Amazon deals so good, Jeff is nervous',
      actionText: 'See Today\'s',
      url: 'https://amzn.to/3Krnk9D',
      type: 'affiliate',
    },
    {
      id: 'lululemon-wmtm',
      text: '"We Made Too Much" - Lululemon\'s fancy way of saying SALE',
      actionText: 'Shop 40% Off',
      url: 'https://shopstyle.it/l/cuM9e',
      type: 'affiliate',
    },
    {
      id: 'walmart-rollback',
      text: '👀 Walmart prices dropping faster than my standards',
      actionText: 'Rollbacks',
      url: 'https://shopstyle.it/l/cuM9l',
      type: 'affiliate',
    },
    {
      id: 'amazon-lightning',
      text: '⚡ Lightning Deals: Faster than your ex moving on',
      actionText: 'Quick Look',
      url: affiliateLinks.amazon.lightningDeals,
      type: 'affiliate',
    },
    {
      id: 'gap-sale',
      text: 'Gap sale: Dress like you have your life together',
      actionText: 'Shop 40% Off',
      url: 'https://shopstyle.it/l/cuNbc',
      type: 'affiliate',
    },
    {
      id: 'cabelas-outdoor',
      text: '🏕️ Cabela\'s: Gear up before nature humbles you',
      actionText: 'Browse Deals',
      url: 'https://click.linksynergy.com/fs-bin/click?id=sUVpAjRtGL4&offerid=1552516.5&type=3&subid=0',
      type: 'affiliate',
    },
    {
      id: 'lululemon-align',
      text: '🧘‍♀️ Align pants aligned with your budget (finally)',
      actionText: 'WMTM Sale',
      url: 'https://shopstyle.it/l/cuM9e',
      type: 'affiliate',
    },
    {
      id: 'amazon-warehouse',
      text: '📦 Slightly dented boxes, majorly dented prices',
      actionText: 'Warehouse',
      url: affiliateLinks.amazon.warehouse,
      type: 'affiliate',
    },
    {
      id: 'walmart-deals',
      text: '🛒 Great Value™ prices on name brand stuff',
      actionText: 'View Deals',
      url: 'https://shopstyle.it/l/cuM9l',
      type: 'affiliate',
    },
    {
      id: 'gap-factory',
      text: 'Gap Factory: Where basics become affordable',
      actionText: 'Extra 40% Off',
      url: 'https://shopstyle.it/l/cuNbc',
      type: 'affiliate',
    },
  ];

  useEffect(() => {
    // Rotate ads every 10 seconds
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 300);
    }, 8000); // Rotate every 8 seconds for better engagement

    return () => clearInterval(interval);
  }, []);

  const handleAdPress = () => {
    const currentAd = ads[currentAdIndex];

    // Track the click for analytics
    trackAffiliateClick(currentAd.id, 'bottom_ad_bar');

    if (currentAd.type === 'premium') {
      // Handle premium upgrade internally
      // You can navigate to a premium screen or show a modal
      console.log('Navigate to premium screen');
    } else {
      // Open external links
      Linking.openURL(currentAd.url).catch(err =>
        console.error('Failed to open URL:', err)
      );
    }
  };

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  if (!isVisible) return null;

  const currentAd = ads[currentAdIndex];

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'bottom' ? styles.bottom : styles.top,
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.adText} numberOfLines={1}>
            {currentAd.text}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAdPress}
        >
          <Text style={styles.actionText}>{currentAd.actionText}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 100,
  },
  bottom: {
    bottom: 0,
  },
  top: {
    top: 0,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  adText: {
    fontSize: 13,
    color: theme.colors.foreground,
    fontWeight: '500',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: theme.colors.foreground,
    borderRadius: 4,
    marginRight: 8,
    transform: [{ scale: 1 }],
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.background,
  },
  closeButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    color: theme.colors.mutedForeground,
    fontWeight: 'bold',
  },
});
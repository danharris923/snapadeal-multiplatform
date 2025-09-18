import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { supabase } from './supabase';
import { NotificationPreferences, LocationPreference, Deal, PushNotificationPayload } from '../types';

class NotificationService {
  private pushToken: string | null = null;

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true; // Auto-granted on older versions
      }

      // iOS permissions would be handled by react-native-push-notification
      // or @react-native-firebase/messaging
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Initialize push notifications
  async initializePushNotifications(userId: string): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Notifications Disabled',
          'Enable notifications in settings to get deal alerts near you!'
        );
        return;
      }

      // Here you would typically use:
      // - @react-native-firebase/messaging for Firebase
      // - react-native-push-notification for local notifications
      // - @react-native-async-storage/async-storage for token storage

      // For now, we'll simulate a token
      this.pushToken = `push_token_${userId}_${Date.now()}`;

      // Save token to user profile
      await supabase
        .from('users')
        .update({ push_token: this.pushToken })
        .eq('id', userId);

      console.log('Push notifications initialized for user:', userId);
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  // Get user notification preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create default preferences
        return await this.createDefaultPreferences(userId);
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return null;
    }
  }

  // Create default notification preferences
  async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
    const defaultPreferences: Omit<NotificationPreferences, 'created_at' | 'updated_at'> = {
      user_id: userId,
      push_enabled: false,
      email_enabled: false,
      deal_alerts_enabled: false,
      proximity_enabled: false,
      proximity_radius: 5, // 5km default
      alert_categories: [],
      alert_stores: [],
      alert_keywords: [],
      min_discount_percentage: 20, // 20% minimum discount
      max_price: 500, // $500 max price for alerts
      preferred_locations: [],
    };

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({
          ...defaultPreferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating default preferences:', error);
      throw error;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Add preferred location
  async addPreferredLocation(
    userId: string,
    location: Omit<LocationPreference, 'id'>
  ): Promise<void> {
    try {
      const preferences = await this.getNotificationPreferences(userId);
      if (!preferences) return;

      const newLocation: LocationPreference = {
        id: `loc_${Date.now()}`,
        ...location,
      };

      const updatedLocations = [...preferences.preferred_locations, newLocation];

      await this.updateNotificationPreferences(userId, {
        preferred_locations: updatedLocations,
      });
    } catch (error) {
      console.error('Error adding preferred location:', error);
      throw error;
    }
  }

  // Remove preferred location
  async removePreferredLocation(userId: string, locationId: string): Promise<void> {
    try {
      const preferences = await this.getNotificationPreferences(userId);
      if (!preferences) return;

      const updatedLocations = preferences.preferred_locations.filter(
        loc => loc.id !== locationId
      );

      await this.updateNotificationPreferences(userId, {
        preferred_locations: updatedLocations,
      });
    } catch (error) {
      console.error('Error removing preferred location:', error);
      throw error;
    }
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Check if deal matches user's notification criteria
  async checkDealNotificationTriggers(deal: Deal): Promise<void> {
    try {
      // Get all users with notifications enabled
      const { data: users, error } = await supabase
        .from('notification_preferences')
        .select(`
          *,
          users!inner(id, push_token)
        `)
        .eq('deal_alerts_enabled', true)
        .eq('push_enabled', true);

      if (error || !users) return;

      for (const userPref of users) {
        const shouldNotify = await this.shouldNotifyUser(deal, userPref);
        if (shouldNotify) {
          await this.sendDealNotification(deal, userPref);
        }
      }
    } catch (error) {
      console.error('Error checking deal notification triggers:', error);
    }
  }

  // Check if user should be notified about this deal
  private async shouldNotifyUser(
    deal: Deal,
    userPreferences: NotificationPreferences & { users: { id: string; push_token: string } }
  ): Promise<boolean> {
    // Check category filter
    if (
      userPreferences.alert_categories.length > 0 &&
      deal.category &&
      !userPreferences.alert_categories.includes(deal.category)
    ) {
      return false;
    }

    // Check store filter
    if (
      userPreferences.alert_stores.length > 0 &&
      !userPreferences.alert_stores.includes(deal.store)
    ) {
      return false;
    }

    // Check keywords in title/description
    if (userPreferences.alert_keywords.length > 0) {
      const dealText = `${deal.title} ${deal.description || ''}`.toLowerCase();
      const hasKeyword = userPreferences.alert_keywords.some(keyword =>
        dealText.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }

    // Check minimum discount
    if (
      userPreferences.min_discount_percentage &&
      deal.discount_percentage &&
      deal.discount_percentage < userPreferences.min_discount_percentage
    ) {
      return false;
    }

    // Check maximum price
    if (
      userPreferences.max_price &&
      deal.price &&
      deal.price > userPreferences.max_price
    ) {
      return false;
    }

    // Check proximity (this would require store location data)
    if (userPreferences.proximity_enabled && userPreferences.preferred_locations.length > 0) {
      // For now, we'll skip proximity check since we need store coordinates
      // In a real implementation, you'd have a stores table with lat/lng
      console.log('Proximity check skipped - need store location data');
    }

    return true;
  }

  // Send notification to user
  private async sendDealNotification(
    deal: Deal,
    userPreferences: NotificationPreferences & { users: { id: string; push_token: string } }
  ): Promise<void> {
    try {
      const title = `🔥 New Deal Alert!`;
      const discountText = deal.discount_percentage ? ` ${deal.discount_percentage}% off` : '';
      const body = `${deal.title}${discountText} at ${deal.store}`;

      const payload: PushNotificationPayload = {
        title,
        body,
        data: {
          deal_id: deal.id,
          type: 'deal_alert',
          store: deal.store,
          discount: deal.discount_percentage?.toString(),
        },
      };

      // Here you would send the actual push notification
      // using Firebase Cloud Messaging or similar service
      console.log('Would send notification:', payload);

      // Log notification trigger
      await supabase
        .from('notification_triggers')
        .insert({
          user_id: userPreferences.user_id,
          deal_id: deal.id,
          trigger_type: 'alert',
          trigger_value: 'deal_posted',
          sent_at: new Date().toISOString(),
        });

    } catch (error) {
      console.error('Error sending deal notification:', error);
    }
  }

  // Test notification (for debugging)
  async sendTestNotification(userId: string): Promise<void> {
    try {
      const testDeal: Partial<Deal> = {
        id: 'test_deal',
        title: 'Test Deal - 50% Off Electronics',
        store: 'Best Buy',
        discount_percentage: 50,
        price: 99.99,
      };

      console.log('Sending test notification to user:', userId);

      // In a real app, this would trigger an actual push notification
      Alert.alert(
        '🔔 Test Notification',
        'Deal alerts are working! You would receive push notifications for deals matching your preferences.'
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  // Get notification history
  async getNotificationHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notification_triggers')
        .select(`
          *,
          deals(title, store, discount_percentage)
        `)
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  }
}

export const notificationService = new NotificationService();
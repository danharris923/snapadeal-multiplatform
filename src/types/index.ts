export interface Deal {
  id: string;
  title: string;
  description?: string;
  price?: number;
  original_price?: number;
  discount_percentage?: number;
  store: string;
  category?: string;
  image_url?: string;
  deal_url?: string;
  expiry_date?: string;
  source: 'community' | 'flipp';
  upvotes?: number;
  downvotes?: number;
  score?: number;
  submitted_by?: string;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  // Gamification fields
  points?: number;
  level?: number;
  deals_posted?: number;
  total_upvotes_received?: number;
  total_deals_value?: number;
  achievements?: string[];
  created_at?: string;

  // Push notification token
  push_token?: string;
  notification_preferences?: NotificationPreferences;
}

export interface FilterState {
  categories: string[];
  stores: string[];
  priceRange: [number, number];
  source: 'all' | 'community' | 'flipp';
}

export interface UserStats {
  user_id: string;
  points: number;
  level: number;
  deals_posted: number;
  total_upvotes_received: number;
  total_deals_value: number;
  achievements: string[];
  rank?: number;
  last_updated: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_reward: number;
  requirement_type: 'deals_posted' | 'upvotes_received' | 'total_value' | 'consecutive_days';
  requirement_value: number;
  unlocked?: boolean;
}

export interface VoteAction {
  deal_id: string;
  user_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  deal_alerts_enabled: boolean;
  proximity_enabled: boolean;
  proximity_radius: number; // in kilometers

  // Filter-based alerts
  alert_categories: string[];
  alert_stores: string[];
  alert_keywords: string[];
  min_discount_percentage?: number;
  max_price?: number;

  // Location preferences
  preferred_locations: LocationPreference[];

  created_at: string;
  updated_at: string;
}

export interface LocationPreference {
  id: string;
  name: string; // e.g., "Home", "Work", "Gym"
  latitude: number;
  longitude: number;
  radius: number; // in kilometers
  enabled: boolean;
}

export interface NotificationTrigger {
  id: string;
  user_id: string;
  deal_id: string;
  trigger_type: 'proximity' | 'keyword' | 'category' | 'store' | 'discount';
  trigger_value: string;
  distance?: number; // if proximity-based
  sent_at: string;
  opened_at?: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data: {
    deal_id: string;
    type: 'deal_alert';
    store?: string;
    discount?: string;
    distance?: string;
  };
}
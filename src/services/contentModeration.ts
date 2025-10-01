import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Spam patterns to block
const SPAM_PATTERNS = [
  /bit\.ly/i,
  /tinyurl/i,
  /viagra/i,
  /casino/i,
  /click here/i,
  /buy now/i,
  /limited time/i,
  /act now/i,
  /free money/i,
  /earn \$\d+/i,
  /work from home/i,
  /weight loss/i,
  /crypto.*guaranteed/i,
  /investment.*risk free/i,
];

// Suspicious URL patterns (allow legitimate store URLs)
const SUSPICIOUS_URL_PATTERNS = [
  /bit\.ly/,
  /tinyurl/,
  /goo\.gl/,
  /ow\.ly/,
  /t\.co\/[a-zA-Z0-9]{10,}/, // Twitter short links that are overly long
  /[a-z0-9]{20,}\.(xyz|top|click|loan|work)/i, // Sketchy TLDs with random domains
];

// Legitimate Canadian store domains (whitelist)
const LEGITIMATE_STORE_DOMAINS = [
  'amazon.ca',
  'walmart.ca',
  'bestbuy.ca',
  'canadiantire.ca',
  'loblaws.ca',
  'metro.ca',
  'sobeys.com',
  'thebay.com',
  'sportchek.ca',
  'homedepot.ca',
  'lowes.ca',
  'costco.ca',
  'shoppers.ca',
  'rexall.ca',
  'londondrugs.com',
  'saveonfoods.com',
  'superstore.ca',
  'nofrills.ca',
  'safeway.ca',
];

export interface RateLimitResult {
  allowed: boolean;
  remainingTime?: number;
  message?: string;
}

export interface ContentModerationResult {
  allowed: boolean;
  reason?: string;
  flagged?: boolean;
}

class ContentModerationService {
  private readonly RATE_LIMIT_KEY = '@SnapADeal:postTimestamps';
  private readonly MAX_POSTS_PER_WINDOW = 2;
  private readonly RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if user can post based on rate limiting
   * Allows 2 posts per 5 minutes
   */
  async checkRateLimit(userId: string, userReputation: number = 0): Promise<RateLimitResult> {
    try {
      const key = `${this.RATE_LIMIT_KEY}:${userId}`;
      const timestampsJson = await AsyncStorage.getItem(key);
      const timestamps: number[] = timestampsJson ? JSON.parse(timestampsJson) : [];

      const now = Date.now();
      const windowStart = now - this.RATE_LIMIT_WINDOW_MS;

      // Filter out timestamps outside the window
      const recentTimestamps = timestamps.filter(ts => ts > windowStart);

      // Low reputation users get stricter limits (1 post per 10 min)
      const maxPosts = userReputation < 10 ? 1 : this.MAX_POSTS_PER_WINDOW;
      const windowMs = userReputation < 10 ? 10 * 60 * 1000 : this.RATE_LIMIT_WINDOW_MS;

      if (recentTimestamps.length >= maxPosts) {
        const oldestRecentTimestamp = Math.min(...recentTimestamps);
        const remainingTime = Math.ceil((oldestRecentTimestamp + windowMs - now) / 1000 / 60);

        return {
          allowed: false,
          remainingTime,
          message: `Please wait ${remainingTime} minute${remainingTime > 1 ? 's' : ''} before posting again`,
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: true }; // Fail open to not block legitimate users
    }
  }

  /**
   * Record a successful post for rate limiting
   */
  async recordPost(userId: string): Promise<void> {
    try {
      const key = `${this.RATE_LIMIT_KEY}:${userId}`;
      const timestampsJson = await AsyncStorage.getItem(key);
      const timestamps: number[] = timestampsJson ? JSON.parse(timestampsJson) : [];

      const now = Date.now();
      const windowStart = now - this.RATE_LIMIT_WINDOW_MS;

      // Add current timestamp and clean old ones
      const updatedTimestamps = [...timestamps.filter(ts => ts > windowStart), now];

      await AsyncStorage.setItem(key, JSON.stringify(updatedTimestamps));
    } catch (error) {
      console.error('Error recording post:', error);
    }
  }

  /**
   * Check content for spam patterns
   */
  checkContentForSpam(title: string, description: string, url?: string): ContentModerationResult {
    const combinedText = `${title} ${description}`;

    // Check for spam patterns
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(combinedText)) {
        return {
          allowed: false,
          reason: 'Content contains prohibited keywords or patterns',
          flagged: true,
        };
      }
    }

    // Check URL if provided
    if (url && url.trim() !== '') {
      // Check if it's a suspicious URL
      for (const pattern of SUSPICIOUS_URL_PATTERNS) {
        if (pattern.test(url)) {
          // Check if it's whitelisted
          const isLegitimate = LEGITIMATE_STORE_DOMAINS.some(domain =>
            url.toLowerCase().includes(domain)
          );

          if (!isLegitimate) {
            return {
              allowed: false,
              reason: 'URL appears suspicious. Please use direct store links.',
              flagged: true,
            };
          }
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Check if new account (< 24 hours old) is trying to post links
   */
  async checkNewAccountRestrictions(userId: string, url?: string): Promise<ContentModerationResult> {
    try {
      // Get user creation date from Supabase
      const { data: user, error } = await supabase.auth.getUser();

      if (error || !user?.user) {
        return { allowed: true }; // Fail open
      }

      const accountCreatedAt = new Date(user.user.created_at);
      const accountAgeHours = (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60);

      // New accounts (< 24 hours) can't post links
      if (accountAgeHours < 24 && url && url.trim() !== '') {
        return {
          allowed: false,
          reason: 'New accounts must wait 24 hours before posting links. You can still post deals without URLs.',
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking new account restrictions:', error);
      return { allowed: true }; // Fail open
    }
  }

  /**
   * Report content as spam/abuse
   */
  async reportContent(
    dealId: string,
    reportedBy: string,
    reason: 'spam' | 'scam' | 'inappropriate' | 'fake' | 'other',
    details?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user already reported this deal
      const { data: existingReport } = await supabase
        .from('flagged_content')
        .select('id')
        .eq('deal_id', dealId)
        .eq('reported_by', reportedBy)
        .single();

      if (existingReport) {
        return {
          success: false,
          error: 'You have already reported this deal',
        };
      }

      // Create report
      const { error } = await supabase
        .from('flagged_content')
        .insert({
          deal_id: dealId,
          reported_by: reportedBy,
          reason,
          details: details || null,
          created_at: new Date().toISOString(),
          status: 'pending',
        });

      if (error) {
        console.error('Error reporting content:', error);
        return {
          success: false,
          error: 'Failed to submit report',
        };
      }

      // Check if deal has 3+ reports, auto-hide it
      await this.checkAndHideReportedContent(dealId);

      return { success: true };
    } catch (error) {
      console.error('Error reporting content:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  /**
   * Check if deal has enough reports to be auto-hidden
   */
  private async checkAndHideReportedContent(dealId: string): Promise<void> {
    try {
      const { data: reports } = await supabase
        .from('flagged_content')
        .select('id')
        .eq('deal_id', dealId)
        .eq('status', 'pending');

      const reportCount = reports?.length || 0;

      // Auto-hide if 3+ reports
      if (reportCount >= 3) {
        await supabase
          .from('deals')
          .update({
            is_active: false,
            moderation_status: 'hidden',
            updated_at: new Date().toISOString(),
          })
          .eq('id', dealId);

        console.log(`Deal ${dealId} auto-hidden due to ${reportCount} reports`);
      }
    } catch (error) {
      console.error('Error checking reported content:', error);
    }
  }

  /**
   * Comprehensive content check before submission
   */
  async validateDealSubmission(
    userId: string,
    title: string,
    description: string,
    url: string | undefined,
    userReputation: number = 0
  ): Promise<{ allowed: boolean; message?: string }> {
    // 1. Check rate limit
    const rateLimitCheck = await this.checkRateLimit(userId, userReputation);
    if (!rateLimitCheck.allowed) {
      return {
        allowed: false,
        message: rateLimitCheck.message,
      };
    }

    // 2. Check spam patterns
    const spamCheck = this.checkContentForSpam(title, description, url);
    if (!spamCheck.allowed) {
      return {
        allowed: false,
        message: spamCheck.reason,
      };
    }

    // 3. Check new account restrictions
    const newAccountCheck = await this.checkNewAccountRestrictions(userId, url);
    if (!newAccountCheck.allowed) {
      return {
        allowed: false,
        message: newAccountCheck.reason,
      };
    }

    return { allowed: true };
  }
}

export const contentModerationService = new ContentModerationService();

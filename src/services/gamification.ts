import { supabase } from './supabase';
import { UserStats, Achievement, VoteAction } from '../types';
import { advancedRankingService } from './advancedRanking';

// Points system configuration
export const POINTS_CONFIG = {
  DEAL_POSTED: 10,
  UPVOTE_RECEIVED: 2,
  UPVOTE_GIVEN: 1,
  HIGH_VALUE_DEAL: 5, // Bonus for deals over $50 savings
  FIRST_DEAL: 25, // Bonus for first deal posted
  WEEKLY_STREAK: 15, // Bonus for posting deals multiple days in a week
};

// Level thresholds
export const LEVEL_THRESHOLDS = [
  0, 50, 150, 300, 500, 750, 1000, 1500, 2000, 3000, 5000
];

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_deal',
    name: 'Deal Hunter',
    description: 'Posted your first deal',
    icon: '🎯',
    points_reward: 25,
    requirement_type: 'deals_posted',
    requirement_value: 1,
  },
  {
    id: 'deal_master',
    name: 'Deal Master',
    description: 'Posted 10 deals',
    icon: '⭐',
    points_reward: 50,
    requirement_type: 'deals_posted',
    requirement_value: 10,
  },
  {
    id: 'popular_poster',
    name: 'Popular Poster',
    description: 'Received 50 upvotes',
    icon: '👑',
    points_reward: 75,
    requirement_type: 'upvotes_received',
    requirement_value: 50,
  },
  {
    id: 'savings_hero',
    name: 'Savings Hero',
    description: 'Helped others save $1000+',
    icon: '💰',
    points_reward: 100,
    requirement_type: 'total_value',
    requirement_value: 1000,
  },
  {
    id: 'deal_legend',
    name: 'Deal Legend',
    description: 'Posted 50 deals',
    icon: '🏆',
    points_reward: 200,
    requirement_type: 'deals_posted',
    requirement_value: 50,
  },
];

class GamificationService {
  // Initialize user stats
  async initializeUserStats(userId: string): Promise<UserStats> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // User stats don't exist, create them
        const newStats: Partial<UserStats> = {
          user_id: userId,
          points: 0,
          level: 1,
          deals_posted: 0,
          total_upvotes_received: 0,
          total_deals_value: 0,
          achievements: [],
          last_updated: new Date().toISOString(),
        };

        const { data: created, error: createError } = await supabase
          .from('user_stats')
          .insert(newStats)
          .select()
          .single();

        if (createError) throw createError;
        return created;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error initializing user stats:', error);
      throw error;
    }
  }

  // Get user stats
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Initialize if doesn't exist
        console.log(`📊 Initializing new user stats for ${userId}`);
        return await this.initializeUserStats(userId);
      }

      if (error) {
        console.error('Error getting user stats:', error);
        throw error;
      }

      console.log(`📊 Retrieved user stats for ${userId}:`, {
        points: data.points,
        level: data.level,
        deals_posted: data.deals_posted,
        reputation_score: data.reputation_score,
      });

      return data;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Calculate reputation score based on activity
  calculateReputationScore(stats: UserStats): number {
    let reputation = 0;

    // Base points from total points
    reputation += Math.floor(stats.points / 10);

    // Bonus for upvotes received (quality indicator)
    reputation += stats.total_upvotes_received * 2;

    // Bonus for deals posted (activity)
    reputation += stats.deals_posted * 3;

    // Penalty for flagged content
    const flaggedCount = stats.flagged_posts || 0;
    if (flaggedCount > 0) {
      reputation -= flaggedCount * 20;
    }

    // Never go below 0
    return Math.max(0, reputation);
  }

  // Award points for deal posting with ELO rating update
  async awardDealPostPoints(userId: string, dealValue: number = 0): Promise<void> {
    try {
      const stats = await this.getUserStats(userId);
      if (!stats) return;

      let pointsToAward = POINTS_CONFIG.DEAL_POSTED;

      // First deal bonus
      if (stats.deals_posted === 0) {
        pointsToAward += POINTS_CONFIG.FIRST_DEAL;
      }

      // High value deal bonus
      if (dealValue >= 50) {
        pointsToAward += POINTS_CONFIG.HIGH_VALUE_DEAL;
      }

      // Calculate ELO rating (stored in points field for now)
      // Higher value deals get better "performance" score
      const dealPerformance = Math.min(1.0, dealValue / 100); // Normalize to 0-1

      const updatedStats = {
        ...stats,
        points: stats.points + pointsToAward,
        deals_posted: stats.deals_posted + 1,
        total_deals_value: stats.total_deals_value + dealValue,
        level: this.calculateLevel(stats.points + pointsToAward),
      };

      const reputationScore = this.calculateReputationScore(updatedStats);

      const newStats = {
        points: updatedStats.points,
        deals_posted: updatedStats.deals_posted,
        total_deals_value: updatedStats.total_deals_value,
        level: updatedStats.level,
        reputation_score: reputationScore,
        last_updated: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('user_stats')
        .update(newStats)
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Failed to update user stats:', updateError);
        throw updateError;
      }

      console.log(`✅ Updated user stats for ${userId}:`, {
        points: newStats.points,
        deals_posted: newStats.deals_posted,
        reputation_score: newStats.reputation_score,
        pointsAwarded: pointsToAward,
      });

      // Update ELO-style rating based on deal value
      await advancedRankingService.updateUserRating(userId, dealPerformance);

      // Check for achievements
      await this.checkAchievements(userId, { ...stats, ...newStats });

    } catch (error) {
      console.error('Error awarding deal post points:', error);
    }
  }

  // Handle vote actions
  async handleVote(dealId: string, voterId: string, dealOwnerId: string, voteType: 'upvote' | 'downvote'): Promise<void> {
    try {
      // Check if user already voted on this deal
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('deal_id', dealId)
        .eq('user_id', voterId)
        .single();

      if (existingVote) {
        // Update existing vote
        await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('deal_id', dealId)
          .eq('user_id', voterId);
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            deal_id: dealId,
            user_id: voterId,
            vote_type: voteType,
            created_at: new Date().toISOString(),
          });
      }

      // Award points to voters (small amount for engagement)
      if (voteType === 'upvote') {
        await this.awardPoints(voterId, POINTS_CONFIG.UPVOTE_GIVEN);

        // Award points to deal owner for receiving upvote
        if (dealOwnerId !== voterId) {
          await this.awardUpvoteReceivedPoints(dealOwnerId);
        }
      }

      // Update deal score with advanced ranking
      await this.updateDealScore(dealId);

      // Calculate advanced ranking scores
      await advancedRankingService.calculateDealRanking(dealId);

    } catch (error) {
      console.error('Error handling vote:', error);
    }
  }

  // Award points for receiving upvotes
  async awardUpvoteReceivedPoints(userId: string): Promise<void> {
    try {
      const stats = await this.getUserStats(userId);
      if (!stats) return;

      const updatedStats = {
        ...stats,
        points: stats.points + POINTS_CONFIG.UPVOTE_RECEIVED,
        total_upvotes_received: stats.total_upvotes_received + 1,
        level: this.calculateLevel(stats.points + POINTS_CONFIG.UPVOTE_RECEIVED),
      };

      const reputationScore = this.calculateReputationScore(updatedStats);

      const newStats = {
        points: updatedStats.points,
        total_upvotes_received: updatedStats.total_upvotes_received,
        level: updatedStats.level,
        reputation_score: reputationScore,
        last_updated: new Date().toISOString(),
      };

      await supabase
        .from('user_stats')
        .update(newStats)
        .eq('user_id', userId);

      // Check for achievements
      await this.checkAchievements(userId, { ...stats, ...newStats });

    } catch (error) {
      console.error('Error awarding upvote received points:', error);
    }
  }

  // Penalize user for flagged content
  async recordFlaggedContent(userId: string): Promise<void> {
    try {
      const stats = await this.getUserStats(userId);
      if (!stats) return;

      const flaggedPosts = (stats.flagged_posts || 0) + 1;

      const updatedStats = {
        ...stats,
        flagged_posts: flaggedPosts,
      };

      const reputationScore = this.calculateReputationScore(updatedStats);

      await supabase
        .from('user_stats')
        .update({
          flagged_posts: flaggedPosts,
          reputation_score: reputationScore,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', userId);

      console.log(`⚠️ User ${userId} has ${flaggedPosts} flagged posts, reputation: ${reputationScore}`);
    } catch (error) {
      console.error('Error recording flagged content:', error);
    }
  }

  // Award points directly
  async awardPoints(userId: string, points: number): Promise<void> {
    try {
      const stats = await this.getUserStats(userId);
      if (!stats) return;

      const newPoints = stats.points + points;
      const newLevel = this.calculateLevel(newPoints);

      await supabase
        .from('user_stats')
        .update({
          points: newPoints,
          level: newLevel,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', userId);

    } catch (error) {
      console.error('Error awarding points:', error);
    }
  }

  // Calculate level from points
  calculateLevel(points: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  // Get points needed for next level
  getPointsToNextLevel(currentPoints: number): number {
    const currentLevel = this.calculateLevel(currentPoints);
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
      return 0; // Max level reached
    }
    return LEVEL_THRESHOLDS[currentLevel] - currentPoints;
  }

  // Check and unlock achievements
  async checkAchievements(userId: string, stats: UserStats): Promise<string[]> {
    const newAchievements: string[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (stats.achievements.includes(achievement.id)) continue;

      let requirement = 0;
      switch (achievement.requirement_type) {
        case 'deals_posted':
          requirement = stats.deals_posted;
          break;
        case 'upvotes_received':
          requirement = stats.total_upvotes_received;
          break;
        case 'total_value':
          requirement = stats.total_deals_value;
          break;
      }

      if (requirement >= achievement.requirement_value) {
        newAchievements.push(achievement.id);

        // Award achievement points
        await this.awardPoints(userId, achievement.points_reward);

        // Update achievements array
        const updatedAchievements = [...stats.achievements, achievement.id];
        await supabase
          .from('user_stats')
          .update({
            achievements: updatedAchievements,
            last_updated: new Date().toISOString(),
          })
          .eq('user_id', userId);
      }
    }

    return newAchievements;
  }

  // Get leaderboard with ELO ratings
  async getLeaderboard(limit: number = 10): Promise<UserStats[]> {
    try {
      // Try to get advanced leaderboard first
      const advancedLeaderboard = await advancedRankingService.getUserLeaderboard(limit);

      if (advancedLeaderboard.length > 0) {
        // Map advanced ratings to UserStats format
        return advancedLeaderboard.map((rating, index) => ({
          user_id: rating.user_id,
          points: rating.elo_rating, // Use ELO as points
          level: this.calculateLevel(rating.elo_rating),
          deals_posted: rating.deals_posted,
          total_upvotes_received: 0, // Will be calculated
          total_deals_value: rating.total_deal_value || 0,
          achievements: [],
          last_updated: rating.last_updated,
          rank: index + 1,
          elo_rating: rating.elo_rating,
          reputation_score: rating.reputation_score,
        }));
      }

      // Fallback to simple leaderboard
      const { data, error } = await supabase
        .from('user_stats')
        .select(`
          *,
          users!inner(email)
        `)
        .order('points', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Update deal score based on votes
  async updateDealScore(dealId: string): Promise<void> {
    try {
      const { data: votes, error } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('deal_id', dealId);

      if (error) throw error;

      const upvotes = votes?.filter(v => v.vote_type === 'upvote').length || 0;
      const downvotes = votes?.filter(v => v.vote_type === 'downvote').length || 0;
      const score = upvotes - downvotes;

      await supabase
        .from('deals')
        .update({
          upvotes,
          downvotes,
          score,
        })
        .eq('id', dealId);

    } catch (error) {
      console.error('Error updating deal score:', error);
    }
  }

  // Get user's vote on a deal
  async getUserVote(dealId: string, userId: string): Promise<'upvote' | 'downvote' | null> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('deal_id', dealId)
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        return null; // No vote found
      }

      if (error) throw error;
      return data.vote_type;
    } catch (error) {
      console.error('Error getting user vote:', error);
      return null;
    }
  }

  // Get trending deals using advanced ranking
  async getTrendingDeals(limit: number = 20): Promise<any[]> {
    try {
      // Try advanced ranking first
      const trendingDeals = await advancedRankingService.getTrendingDeals(limit);

      if (trendingDeals.length > 0) {
        return trendingDeals;
      }

      // Fallback to simple ranking by votes and time
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Simple hot score calculation for fallback
      return (data || [])
        .map(deal => {
          const ageInHours = (Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60);
          const score = (deal.upvotes || 0) - (deal.downvotes || 0);
          const hotScore = score / Math.pow(ageInHours + 2, 1.8);
          return { ...deal, hot_score: hotScore };
        })
        .sort((a, b) => b.hot_score - a.hot_score);

    } catch (error) {
      console.error('Error getting trending deals:', error);
      return [];
    }
  }
}

export const gamificationService = new GamificationService();
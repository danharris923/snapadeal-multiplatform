import { supabase } from './supabase';
import { UserStats, Achievement, VoteAction } from '../types';

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
        return await this.initializeUserStats(userId);
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Award points for deal posting
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

      const newStats = {
        points: stats.points + pointsToAward,
        deals_posted: stats.deals_posted + 1,
        total_deals_value: stats.total_deals_value + dealValue,
        level: this.calculateLevel(stats.points + pointsToAward),
        last_updated: new Date().toISOString(),
      };

      await supabase
        .from('user_stats')
        .update(newStats)
        .eq('user_id', userId);

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

      // Update deal score
      await this.updateDealScore(dealId);

    } catch (error) {
      console.error('Error handling vote:', error);
    }
  }

  // Award points for receiving upvotes
  async awardUpvoteReceivedPoints(userId: string): Promise<void> {
    try {
      const stats = await this.getUserStats(userId);
      if (!stats) return;

      const newStats = {
        points: stats.points + POINTS_CONFIG.UPVOTE_RECEIVED,
        total_upvotes_received: stats.total_upvotes_received + 1,
        level: this.calculateLevel(stats.points + POINTS_CONFIG.UPVOTE_RECEIVED),
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

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<UserStats[]> {
    try {
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
}

export const gamificationService = new GamificationService();
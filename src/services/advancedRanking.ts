import { supabase } from './supabase';

/**
 * Advanced Ranking System
 *
 * Combines multiple algorithms:
 * 1. Reddit-style Hot Score (time decay + vote ratio)
 * 2. Wilson Score (confidence interval for true positive ratio)
 * 3. ELO-style User Rating System
 * 4. Bayesian Average for Deal Quality
 * 5. Holmstrom-Meyer style reputation weighting
 */

// Configuration constants
export const RANKING_CONFIG = {
  // Reddit-style hot score
  HOT_SCORE: {
    TIME_DECAY: 45000, // 45 seconds in milliseconds (Reddit uses 45000)
    UPVOTE_WEIGHT: 1,
    DOWNVOTE_WEIGHT: -1,
    SUBMISSION_BOOST: 0.1, // Small boost for new submissions
  },

  // ELO-style rating
  ELO: {
    INITIAL_RATING: 1200,
    K_FACTOR: 32, // How much ratings change per match
    MIN_RATING: 100,
    MAX_RATING: 3000,
  },

  // Bayesian parameters
  BAYESIAN: {
    PRIOR_MEAN: 3.0, // Assume average deal quality is 3/5
    PRIOR_WEIGHT: 5, // Confidence in prior (equivalent to 5 votes)
    MIN_VOTES_FOR_RANKING: 3, // Minimum votes before Bayesian kicks in
  },

  // Reputation weights
  REPUTATION: {
    TRUSTED_USER_THRESHOLD: 1800, // ELO rating threshold for trusted users
    TRUSTED_VOTE_WEIGHT: 1.5, // Trusted users' votes count more
    NEW_USER_WEIGHT: 0.7, // New users' votes count less
    SPAM_THRESHOLD: 800, // Below this, votes are heavily penalized
  },
};

interface UserRating {
  user_id: string;
  elo_rating: number;
  reputation_score: number;
  deals_posted: number;
  vote_accuracy: number; // How often their votes align with community
  last_updated: string;
}

interface DealScore {
  deal_id: string;
  hot_score: number;
  wilson_score: number;
  bayesian_average: number;
  quality_score: number;
  final_rank: number;
  confidence_level: number;
  last_calculated: string;
}

class AdvancedRankingService {

  /**
   * Reddit-style Hot Score
   * Formula: log10(max(|ups - downs|, 1)) + (sign * seconds) / 45000
   */
  calculateHotScore(upvotes: number, downvotes: number, submissionTime: Date): number {
    const score = upvotes - downvotes;
    const order = Math.log10(Math.max(Math.abs(score), 1));

    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = Math.floor((submissionTime.getTime() - new Date('2005-12-09').getTime()) / 1000);

    return order + (sign * seconds) / RANKING_CONFIG.HOT_SCORE.TIME_DECAY;
  }

  /**
   * Wilson Score Confidence Interval
   * Better than simple percentage for small sample sizes
   */
  calculateWilsonScore(upvotes: number, downvotes: number, confidence: number = 0.95): number {
    const n = upvotes + downvotes;
    if (n === 0) return 0;

    const z = confidence === 0.95 ? 1.96 : 2.576; // z-score for confidence level
    const phat = upvotes / n;

    const numerator = phat + (z * z) / (2 * n) - z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * n)) / n);
    const denominator = 1 + (z * z) / n;

    return Math.max(0, numerator / denominator);
  }

  /**
   * Bayesian Average Rating
   * Handles the "cold start" problem for new deals
   */
  calculateBayesianAverage(ratings: number[], totalVotes: number): number {
    const { PRIOR_MEAN, PRIOR_WEIGHT } = RANKING_CONFIG.BAYESIAN;

    if (ratings.length === 0) return PRIOR_MEAN;

    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    const average = sum / ratings.length;

    // Weighted average between prior and observed data
    return (PRIOR_WEIGHT * PRIOR_MEAN + totalVotes * average) / (PRIOR_WEIGHT + totalVotes);
  }

  /**
   * ELO Rating Update
   * Used for user reputation based on deal performance
   */
  updateEloRating(currentRating: number, opponentRating: number, actualScore: number): number {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - currentRating) / 400));
    const newRating = currentRating + RANKING_CONFIG.ELO.K_FACTOR * (actualScore - expectedScore);

    return Math.max(
      RANKING_CONFIG.ELO.MIN_RATING,
      Math.min(RANKING_CONFIG.ELO.MAX_RATING, newRating)
    );
  }

  /**
   * Calculate user reputation weight based on ELO and history
   * Holmstrom-Meyer inspired: experienced users have more influence
   */
  calculateReputationWeight(userRating: UserRating): number {
    const { elo_rating, deals_posted, vote_accuracy } = userRating;
    const { TRUSTED_USER_THRESHOLD, TRUSTED_VOTE_WEIGHT, NEW_USER_WEIGHT, SPAM_THRESHOLD } = RANKING_CONFIG.REPUTATION;

    // Base weight from ELO rating
    let weight = 1.0;

    if (elo_rating >= TRUSTED_USER_THRESHOLD) {
      weight = TRUSTED_VOTE_WEIGHT;
    } else if (elo_rating < SPAM_THRESHOLD) {
      weight = 0.3; // Heavily penalize low-rated users
    } else if (deals_posted < 5) {
      weight = NEW_USER_WEIGHT; // New users have less influence
    }

    // Adjust by vote accuracy
    if (vote_accuracy > 0.8) {
      weight *= 1.2; // Boost for accurate voters
    } else if (vote_accuracy < 0.4) {
      weight *= 0.6; // Penalize inaccurate voters
    }

    return Math.max(0.1, Math.min(2.0, weight)); // Clamp between 0.1 and 2.0
  }

  /**
   * Calculate comprehensive deal ranking
   * Combines all algorithms for final score
   */
  async calculateDealRanking(dealId: string): Promise<DealScore> {
    try {
      // Get deal data
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();

      if (dealError) throw dealError;

      // Get votes with user ratings
      const { data: votes, error: voteError } = await supabase
        .from('deal_votes')
        .select(`
          *,
          user_ratings!inner(*)
        `)
        .eq('deal_id', dealId);

      if (voteError && voteError.code !== 'PGRST116') throw voteError;

      const votesData = votes || [];

      // Calculate weighted votes
      let weightedUpvotes = 0;
      let weightedDownvotes = 0;
      let qualityRatings: number[] = [];

      for (const vote of votesData) {
        const userRating = vote.user_ratings;
        const weight = this.calculateReputationWeight(userRating);

        if (vote.vote_type === 'upvote') {
          weightedUpvotes += weight;
        } else {
          weightedDownvotes += weight;
        }

        // Convert vote to quality rating (upvote = 4/5, downvote = 2/5)
        qualityRatings.push(vote.vote_type === 'upvote' ? 4 : 2);
      }

      // Calculate all scores
      const submissionTime = new Date(deal.created_at);
      const hotScore = this.calculateHotScore(Math.round(weightedUpvotes), Math.round(weightedDownvotes), submissionTime);
      const wilsonScore = this.calculateWilsonScore(Math.round(weightedUpvotes), Math.round(weightedDownvotes));
      const bayesianAverage = this.calculateBayesianAverage(qualityRatings, votesData.length);

      // Quality score combines multiple factors
      const qualityScore = (wilsonScore * 0.4) + (bayesianAverage / 5 * 0.4) + (Math.min(1, votesData.length / 10) * 0.2);

      // Final rank combines hot score with quality
      const finalRank = (hotScore * 0.6) + (qualityScore * 0.4);

      // Confidence level based on vote count and user ratings
      const avgVoterRating = votesData.length > 0
        ? votesData.reduce((sum, v) => sum + v.user_ratings.elo_rating, 0) / votesData.length
        : RANKING_CONFIG.ELO.INITIAL_RATING;

      const confidenceLevel = Math.min(1, (votesData.length / 20) * (avgVoterRating / RANKING_CONFIG.ELO.INITIAL_RATING));

      const dealScore: DealScore = {
        deal_id: dealId,
        hot_score: hotScore,
        wilson_score: wilsonScore,
        bayesian_average: bayesianAverage,
        quality_score: qualityScore,
        final_rank: finalRank,
        confidence_level: confidenceLevel,
        last_calculated: new Date().toISOString(),
      };

      // Store the calculated scores
      await supabase
        .from('deal_scores')
        .upsert(dealScore, { onConflict: 'deal_id' });

      return dealScore;

    } catch (error) {
      console.error('Error calculating deal ranking:', error);
      throw error;
    }
  }

  /**
   * Update user rating based on deal performance
   */
  async updateUserRating(userId: string, dealPerformance: number): Promise<void> {
    try {
      // Get current user rating
      let { data: userRating, error } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create initial rating
        userRating = {
          user_id: userId,
          elo_rating: RANKING_CONFIG.ELO.INITIAL_RATING,
          reputation_score: 0,
          deals_posted: 0,
          vote_accuracy: 0.5,
          last_updated: new Date().toISOString(),
        };
      } else if (error) {
        throw error;
      }

      // Calculate expected performance (average user = 0.5)
      const expectedPerformance = 0.5;
      const communityAvgRating = RANKING_CONFIG.ELO.INITIAL_RATING;

      // Update ELO rating
      const newEloRating = this.updateEloRating(
        userRating.elo_rating,
        communityAvgRating,
        dealPerformance
      );

      // Update reputation score (long-term average)
      const alpha = 0.1; // Learning rate
      const newReputationScore = userRating.reputation_score * (1 - alpha) + dealPerformance * alpha;

      const updatedRating: UserRating = {
        ...userRating,
        elo_rating: newEloRating,
        reputation_score: newReputationScore,
        deals_posted: userRating.deals_posted + 1,
        last_updated: new Date().toISOString(),
      };

      await supabase
        .from('user_ratings')
        .upsert(updatedRating, { onConflict: 'user_id' });

    } catch (error) {
      console.error('Error updating user rating:', error);
    }
  }

  /**
   * Get trending deals using advanced ranking
   */
  async getTrendingDeals(limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          deal_scores(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Get more to re-rank

      if (error) throw error;

      // Recalculate scores for recent deals
      const dealsWithScores = await Promise.all(
        (data || []).map(async (deal) => {
          const score = await this.calculateDealRanking(deal.id);
          return { ...deal, ranking_score: score };
        })
      );

      // Sort by final rank and return top deals
      return dealsWithScores
        .sort((a, b) => b.ranking_score.final_rank - a.ranking_score.final_rank)
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting trending deals:', error);
      return [];
    }
  }

  /**
   * Get user leaderboard based on ELO ratings
   */
  async getUserLeaderboard(limit: number = 10): Promise<UserRating[]> {
    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .select(`
          *,
          users!inner(email)
        `)
        .order('elo_rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error getting user leaderboard:', error);
      return [];
    }
  }
}

export const advancedRankingService = new AdvancedRankingService();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dvmxepugxqrwehycdjou.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2bXhlcHVneHFyd2VoeWNkam91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzIwMzE4NCwiZXhwIjoyMDcyNzc5MTg0fQ.ty4Hqy_0SHGQW2uSvbPonQZME6yHzM-EDPX_lynqY2M';

async function setupAdvancedRanking() {
  console.log('🚀 Setting up advanced ranking system...');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Create user_ratings table
    console.log('📊 Creating user_ratings table...');

    const { error: userRatingsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_ratings (
          user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          elo_rating INTEGER DEFAULT 1200 NOT NULL,
          reputation_score DECIMAL(3,2) DEFAULT 0.5 NOT NULL,
          deals_posted INTEGER DEFAULT 0 NOT NULL,
          vote_accuracy DECIMAL(3,2) DEFAULT 0.5 NOT NULL,
          total_deal_value DECIMAL(12,2) DEFAULT 0 NOT NULL,
          successful_deals INTEGER DEFAULT 0 NOT NULL,
          spam_reports INTEGER DEFAULT 0 NOT NULL,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        -- Indexes for user_ratings
        CREATE INDEX IF NOT EXISTS idx_user_ratings_elo ON user_ratings(elo_rating DESC);
        CREATE INDEX IF NOT EXISTS idx_user_ratings_reputation ON user_ratings(reputation_score DESC);
        CREATE INDEX IF NOT EXISTS idx_user_ratings_updated ON user_ratings(last_updated DESC);
      `
    });

    if (userRatingsError) {
      console.error('❌ Error creating user_ratings table:', userRatingsError);
    } else {
      console.log('✅ user_ratings table created successfully');
    }

    // Create deal_scores table
    console.log('📈 Creating deal_scores table...');

    const { error: dealScoresError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS deal_scores (
          deal_id UUID PRIMARY KEY REFERENCES deals(id) ON DELETE CASCADE,
          hot_score DECIMAL(12,6) DEFAULT 0 NOT NULL,
          wilson_score DECIMAL(8,6) DEFAULT 0 NOT NULL,
          bayesian_average DECIMAL(3,2) DEFAULT 3.0 NOT NULL,
          quality_score DECIMAL(3,2) DEFAULT 0 NOT NULL,
          final_rank DECIMAL(12,6) DEFAULT 0 NOT NULL,
          confidence_level DECIMAL(3,2) DEFAULT 0 NOT NULL,
          weighted_upvotes DECIMAL(8,2) DEFAULT 0 NOT NULL,
          weighted_downvotes DECIMAL(8,2) DEFAULT 0 NOT NULL,
          vote_count INTEGER DEFAULT 0 NOT NULL,
          last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        -- Indexes for deal_scores
        CREATE INDEX IF NOT EXISTS idx_deal_scores_final_rank ON deal_scores(final_rank DESC);
        CREATE INDEX IF NOT EXISTS idx_deal_scores_hot ON deal_scores(hot_score DESC);
        CREATE INDEX IF NOT EXISTS idx_deal_scores_quality ON deal_scores(quality_score DESC);
        CREATE INDEX IF NOT EXISTS idx_deal_scores_calculated ON deal_scores(last_calculated DESC);
      `
    });

    if (dealScoresError) {
      console.error('❌ Error creating deal_scores table:', dealScoresError);
    } else {
      console.log('✅ deal_scores table created successfully');
    }

    // Create deal_votes table (enhanced version)
    console.log('🗳️ Creating enhanced deal_votes table...');

    const { error: dealVotesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS deal_votes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          vote_type VARCHAR(10) CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
          vote_weight DECIMAL(3,2) DEFAULT 1.0 NOT NULL,
          quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
          voter_confidence DECIMAL(3,2) DEFAULT 0.5 NOT NULL,
          is_verified_purchase BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

          -- Prevent duplicate votes per user per deal
          UNIQUE(deal_id, user_id)
        );

        -- Indexes for deal_votes
        CREATE INDEX IF NOT EXISTS idx_deal_votes_deal ON deal_votes(deal_id);
        CREATE INDEX IF NOT EXISTS idx_deal_votes_user ON deal_votes(user_id);
        CREATE INDEX IF NOT EXISTS idx_deal_votes_type ON deal_votes(vote_type);
        CREATE INDEX IF NOT EXISTS idx_deal_votes_created ON deal_votes(created_at DESC);
      `
    });

    if (dealVotesError) {
      console.error('❌ Error creating deal_votes table:', dealVotesError);
    } else {
      console.log('✅ deal_votes table created successfully');
    }

    // Create ranking_history table for analytics
    console.log('📜 Creating ranking_history table...');

    const { error: historyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ranking_history (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          event_type VARCHAR(20) NOT NULL, -- 'vote', 'rank_update', 'quality_change'
          old_rank DECIMAL(12,6),
          new_rank DECIMAL(12,6),
          ranking_factors JSONB, -- Store algorithm components
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        -- Indexes for ranking_history
        CREATE INDEX IF NOT EXISTS idx_ranking_history_deal ON ranking_history(deal_id);
        CREATE INDEX IF NOT EXISTS idx_ranking_history_user ON ranking_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_ranking_history_type ON ranking_history(event_type);
        CREATE INDEX IF NOT EXISTS idx_ranking_history_created ON ranking_history(created_at DESC);
      `
    });

    if (historyError) {
      console.error('❌ Error creating ranking_history table:', historyError);
    } else {
      console.log('✅ ranking_history table created successfully');
    }

    // Create views for easy querying
    console.log('👁️ Creating ranking views...');

    const { error: viewsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- View for trending deals with full scoring data
        CREATE OR REPLACE VIEW trending_deals AS
        SELECT
          d.*,
          ds.final_rank,
          ds.hot_score,
          ds.quality_score,
          ds.confidence_level,
          ds.vote_count,
          ur.elo_rating as submitter_rating,
          ur.reputation_score as submitter_reputation
        FROM deals d
        LEFT JOIN deal_scores ds ON d.id = ds.deal_id
        LEFT JOIN user_ratings ur ON d.submitted_by = ur.user_id
        WHERE d.is_active = true
        ORDER BY ds.final_rank DESC NULLS LAST, d.created_at DESC;

        -- View for user leaderboard with stats
        CREATE OR REPLACE VIEW user_leaderboard AS
        SELECT
          ur.*,
          u.email,
          COUNT(d.id) as total_deals,
          AVG(ds.quality_score) as avg_deal_quality,
          SUM(ds.vote_count) as total_votes_received
        FROM user_ratings ur
        JOIN auth.users u ON ur.user_id = u.id
        LEFT JOIN deals d ON ur.user_id = d.submitted_by
        LEFT JOIN deal_scores ds ON d.id = ds.deal_id
        GROUP BY ur.user_id, ur.elo_rating, ur.reputation_score, ur.deals_posted,
                 ur.vote_accuracy, ur.total_deal_value, ur.successful_deals,
                 ur.spam_reports, ur.last_updated, ur.created_at, u.email
        ORDER BY ur.elo_rating DESC;

        -- View for deal analytics
        CREATE OR REPLACE VIEW deal_analytics AS
        SELECT
          d.id,
          d.title,
          d.store,
          d.created_at,
          ds.final_rank,
          ds.hot_score,
          ds.quality_score,
          ds.confidence_level,
          ds.vote_count,
          COUNT(dv.id) as total_votes,
          COUNT(CASE WHEN dv.vote_type = 'upvote' THEN 1 END) as upvotes,
          COUNT(CASE WHEN dv.vote_type = 'downvote' THEN 1 END) as downvotes,
          AVG(dv.quality_rating) as avg_quality_rating,
          AVG(ur.elo_rating) as avg_voter_rating
        FROM deals d
        LEFT JOIN deal_scores ds ON d.id = ds.deal_id
        LEFT JOIN deal_votes dv ON d.id = dv.deal_id
        LEFT JOIN user_ratings ur ON dv.user_id = ur.user_id
        GROUP BY d.id, d.title, d.store, d.created_at, ds.final_rank,
                 ds.hot_score, ds.quality_score, ds.confidence_level, ds.vote_count
        ORDER BY ds.final_rank DESC NULLS LAST;
      `
    });

    if (viewsError) {
      console.error('❌ Error creating views:', viewsError);
    } else {
      console.log('✅ Views created successfully');
    }

    // Enable RLS policies
    console.log('🔒 Setting up security policies...');

    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS
        ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE deal_scores ENABLE ROW LEVEL SECURITY;
        ALTER TABLE deal_votes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE ranking_history ENABLE ROW LEVEL SECURITY;

        -- User ratings policies
        CREATE POLICY "Users can view all user ratings" ON user_ratings FOR SELECT USING (true);
        CREATE POLICY "Users can update their own rating" ON user_ratings FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "System can manage user ratings" ON user_ratings FOR ALL USING (true);

        -- Deal scores policies
        CREATE POLICY "Anyone can view deal scores" ON deal_scores FOR SELECT USING (true);
        CREATE POLICY "System can manage deal scores" ON deal_scores FOR ALL USING (true);

        -- Deal votes policies
        CREATE POLICY "Users can view all votes" ON deal_votes FOR SELECT USING (true);
        CREATE POLICY "Users can manage their own votes" ON deal_votes FOR ALL USING (auth.uid() = user_id);

        -- Ranking history policies
        CREATE POLICY "Users can view ranking history" ON ranking_history FOR SELECT USING (true);
        CREATE POLICY "System can insert ranking history" ON ranking_history FOR INSERT USING (true);
      `
    });

    if (rlsError) {
      console.error('❌ Error setting up RLS policies:', rlsError);
    } else {
      console.log('✅ Security policies created successfully');
    }

    console.log('🎉 Advanced ranking system setup complete!');
    console.log('');
    console.log('📊 Tables created:');
    console.log('  • user_ratings - ELO ratings and reputation scores');
    console.log('  • deal_scores - Multi-algorithm ranking scores');
    console.log('  • deal_votes - Enhanced voting with weights');
    console.log('  • ranking_history - Analytics and tracking');
    console.log('');
    console.log('👁️ Views created:');
    console.log('  • trending_deals - Ranked deals with full data');
    console.log('  • user_leaderboard - User rankings and stats');
    console.log('  • deal_analytics - Deal performance metrics');
    console.log('');
    console.log('🔧 Algorithms implemented:');
    console.log('  • Reddit-style Hot Score (time decay)');
    console.log('  • Wilson Score Confidence Interval');
    console.log('  • Bayesian Average Rating');
    console.log('  • ELO Rating System');
    console.log('  • Holmstrom-Meyer Reputation Weighting');

  } catch (error) {
    console.error('💥 Error setting up advanced ranking:', error);
  }
}

setupAdvancedRanking();
-- SnapADeal Anti-Spam and Content Moderation Migration
-- Run this in your Supabase SQL editor

-- 1. Add reputation and moderation fields to user_stats table
ALTER TABLE user_stats
ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS flagged_posts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_created_at TIMESTAMP DEFAULT NOW();

-- 2. Add moderation fields to deals table
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- Create index for faster moderation queries
CREATE INDEX IF NOT EXISTS idx_deals_moderation_status ON deals(moderation_status);
CREATE INDEX IF NOT EXISTS idx_deals_report_count ON deals(report_count);

-- 3. Create flagged_content table for tracking reports
CREATE TABLE IF NOT EXISTS flagged_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('spam', 'scam', 'inappropriate', 'fake', 'other')),
  details TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES auth.users(id),
  UNIQUE(deal_id, reported_by)
);

-- Create indexes for flagged_content
CREATE INDEX IF NOT EXISTS idx_flagged_content_deal_id ON flagged_content(deal_id);
CREATE INDEX IF NOT EXISTS idx_flagged_content_status ON flagged_content(status);
CREATE INDEX IF NOT EXISTS idx_flagged_content_reported_by ON flagged_content(reported_by);

-- 4. Enable Row Level Security
ALTER TABLE flagged_content ENABLE ROW LEVEL SECURITY;

-- Policy: Users can report content
CREATE POLICY "Users can report deals" ON flagged_content
  FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

-- Policy: Users can see their own reports
CREATE POLICY "Users can view their own reports" ON flagged_content
  FOR SELECT
  USING (auth.uid() = reported_by);

-- Policy: Admins can see all reports (optional - update with admin role logic)
-- CREATE POLICY "Admins can view all reports" ON flagged_content
--   FOR SELECT
--   USING (auth.jwt()->>'role' = 'admin');

-- 5. Create function to auto-hide heavily reported deals
CREATE OR REPLACE FUNCTION check_and_hide_reported_deals()
RETURNS TRIGGER AS $$
BEGIN
  -- Count pending reports for this deal
  DECLARE
    report_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO report_count
    FROM flagged_content
    WHERE deal_id = NEW.deal_id
      AND status = 'pending';

    -- Auto-hide if 3+ reports
    IF report_count >= 3 THEN
      UPDATE deals
      SET moderation_status = 'hidden',
          is_active = false,
          report_count = report_count,
          updated_at = NOW()
      WHERE id = NEW.deal_id;

      RAISE NOTICE 'Deal % auto-hidden due to % reports', NEW.deal_id, report_count;
    END IF;

    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger for auto-hiding
DROP TRIGGER IF EXISTS trigger_auto_hide_deals ON flagged_content;
CREATE TRIGGER trigger_auto_hide_deals
  AFTER INSERT ON flagged_content
  FOR EACH ROW
  EXECUTE FUNCTION check_and_hide_reported_deals();

-- 7. Create function to update reputation scores
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate reputation when user_stats changes
  UPDATE user_stats
  SET reputation_score = (
    -- Base points
    FLOOR(points / 10) +
    -- Upvote bonus
    (total_upvotes_received * 2) +
    -- Deals posted bonus
    (deals_posted * 3) -
    -- Flagged content penalty
    (COALESCE(flagged_posts, 0) * 20)
  )
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger for reputation updates
DROP TRIGGER IF EXISTS trigger_update_reputation ON user_stats;
CREATE TRIGGER trigger_update_reputation
  AFTER UPDATE OF points, total_upvotes_received, deals_posted, flagged_posts ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_user_reputation();

-- 9. Update existing records with default values
UPDATE user_stats
SET reputation_score = (
  FLOOR(points / 10) +
  (total_upvotes_received * 2) +
  (deals_posted * 3) -
  (COALESCE(flagged_posts, 0) * 20)
)
WHERE reputation_score IS NULL OR reputation_score = 0;

UPDATE deals
SET moderation_status = 'active'
WHERE moderation_status IS NULL;

-- 10. Add helpful comments
COMMENT ON TABLE flagged_content IS 'Stores user reports for community-submitted deals';
COMMENT ON COLUMN flagged_content.reason IS 'Type of violation: spam, scam, inappropriate, fake, or other';
COMMENT ON COLUMN flagged_content.status IS 'Review status: pending, reviewed, dismissed, or actioned';
COMMENT ON COLUMN user_stats.reputation_score IS 'Calculated reputation based on points, upvotes, and flags';
COMMENT ON COLUMN user_stats.flagged_posts IS 'Number of times user content was flagged and confirmed';
COMMENT ON COLUMN deals.moderation_status IS 'Moderation state: active, hidden, or removed';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Anti-spam and content moderation migration completed successfully!';
  RAISE NOTICE 'Tables updated: user_stats, deals, flagged_content (new)';
  RAISE NOTICE 'Triggers created for auto-hiding reported deals and updating reputation';
END $$;

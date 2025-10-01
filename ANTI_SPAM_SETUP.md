# SnapADeal Anti-Spam & Content Moderation System

## 🎯 Overview

This system protects SnapADeal from spam, scams, and malicious content through multiple layers:

1. **Rate Limiting** - Prevents bot flooding
2. **Content Filtering** - Blocks spam keywords and suspicious URLs
3. **Community Reporting** - Users can flag bad content
4. **Reputation System** - Rewards good behavior, penalizes abuse
5. **Auto-Moderation** - Automatically hides heavily reported deals

---

## 📋 Setup Instructions

### 1. Run Supabase Migration

Open your Supabase SQL Editor and run `supabase_migration_anti_spam.sql`:

```bash
# Navigate to Supabase dashboard
https://app.supabase.com/project/YOUR_PROJECT_ID/sql

# Copy and paste the contents of supabase_migration_anti_spam.sql
# Click "Run"
```

This creates:
- `flagged_content` table for tracking reports
- `reputation_score` and `flagged_posts` columns in `user_stats`
- `moderation_status` and `report_count` columns in `deals`
- Triggers for auto-hiding reported deals
- Row Level Security policies

### 2. Verify Tables Exist

Run this query to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user_stats', 'deals', 'flagged_content', 'votes');
```

All 4 tables should be present.

---

## 🛡️ Features

### Rate Limiting

**Regular Users**: 2 posts per 5 minutes
**Low Reputation (<10 points)**: 1 post per 10 minutes
**New Accounts (<24hrs)**: Cannot post URLs

Implementation: `src/services/contentModeration.ts`

### Spam Filters

Blocks content containing:
- Obvious spam keywords (viagra, casino, etc.)
- Suspicious URL shorteners (bit.ly, tinyurl)
- Sketchy TLDs (.xyz, .top, .click) unless whitelisted

Canadian store domains are whitelisted (amazon.ca, walmart.ca, etc.)

### Community Reporting

Users can report deals for:
- Spam
- Scam/Fake
- Inappropriate content
- No longer available

**Auto-Hide**: Deals with 3+ pending reports are automatically hidden.

### Reputation System

Calculated as:
```
reputation = (points / 10) + (upvotes * 2) + (deals_posted * 3) - (flagged_posts * 20)
```

Benefits of high reputation:
- Less strict rate limits
- Trusted user badge (future)
- Priority in search rankings (future)

---

## 🔧 How It Works

### Deal Submission Flow

```
User submits deal
    ↓
Check rate limit (2/5min)
    ↓
Check spam patterns
    ↓
Check new account restrictions
    ↓
Upload to Supabase
    ↓
Award points
    ↓
Update reputation
```

### Reporting Flow

```
User clicks ⚠️ button
    ↓
Select reason (spam/scam/etc)
    ↓
Insert into flagged_content
    ↓
Check report count
    ↓
If ≥3 reports → auto-hide deal
```

---

## 📁 Key Files

### Services
- **`src/services/contentModeration.ts`** - Rate limiting, spam checks, reporting
- **`src/services/gamification.ts`** - Points, reputation, achievements

### Components
- **`src/screens/SnapDealScreen.tsx`** - Deal submission with validation
- **`src/components/DealCard.tsx`** - Report button and voting

### Database
- **`supabase_migration_anti_spam.sql`** - Database schema and triggers

### Types
- **`src/types/index.ts`** - TypeScript interfaces

---

## 🧪 Testing the System

### 1. Test Rate Limiting

```typescript
// Try posting 3 deals rapidly
// Expected: 3rd post blocked with "Please wait X minutes" message
```

### 2. Test Spam Filter

```typescript
// Try posting deal with title: "Click here for free viagra!"
// Expected: Blocked with "Content contains prohibited keywords"
```

### 3. Test Reporting

```typescript
// Post a deal
// Have 3 different users report it
// Expected: Deal automatically hidden
```

### 4. Test Reputation

```typescript
// Post deals, get upvotes
// Check user_stats.reputation_score increases
// Get flagged
// Check reputation decreases
```

---

## 🚨 Troubleshooting

### Points Not Updating

Check console logs for:
```
✅ Points awarded to user [UUID] for deal value $X
```

If missing, check:
1. `user_stats` table exists
2. User has a row in `user_stats`
3. Supabase RLS policies allow updates

### Reports Not Working

Check:
1. `flagged_content` table exists
2. RLS policies allow INSERT for authenticated users
3. Trigger `trigger_auto_hide_deals` exists

```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_auto_hide_deals';
```

### Rate Limiting Not Working

Check:
1. AsyncStorage permissions (Android/iOS)
2. Console logs for validation errors
3. User ID is being passed correctly

---

## 🔮 Future Enhancements

1. **Admin Dashboard**
   - Review flagged content
   - Ban repeat offenders
   - Bulk moderation actions

2. **AI Content Moderation**
   - OpenAI Moderation API
   - Image scanning (AWS Rekognition)
   - Automated scam detection

3. **Advanced Reputation**
   - User badges (Trusted, Expert, etc.)
   - Reputation-based privileges
   - Trust scores in search ranking

4. **Shadowban**
   - Instead of hard blocking, make spam invisible to others
   - Spammer doesn't know they're banned

5. **Rate Limit by IP**
   - Track IPs via Supabase Edge Functions
   - Block VPN/proxy abuse

---

## 📊 Monitoring

### Key Metrics to Track

```sql
-- Reports per day
SELECT DATE(created_at), COUNT(*)
FROM flagged_content
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- Auto-hidden deals
SELECT COUNT(*)
FROM deals
WHERE moderation_status = 'hidden';

-- Users with low reputation
SELECT user_id, reputation_score, flagged_posts
FROM user_stats
WHERE reputation_score < 0
ORDER BY reputation_score ASC;

-- Spam patterns caught
-- (Check logs for blocked submissions)
```

---

## 💡 Best Practices

1. **Never trust client input** - Always validate server-side
2. **Fail open** - If moderation fails, don't block legitimate users
3. **Log everything** - Critical for debugging and improving filters
4. **Community first** - Reports from trusted users > automated filters
5. **Iterate** - Adjust spam patterns based on actual abuse

---

## 🆘 Support

If you encounter issues:

1. Check console logs for error messages
2. Verify Supabase tables and triggers
3. Test with different user accounts
4. Review RLS policies

For database errors, check Supabase logs:
```
https://app.supabase.com/project/YOUR_PROJECT_ID/logs/postgres-logs
```

---

## ✅ Checklist

- [ ] Run `supabase_migration_anti_spam.sql`
- [ ] Verify all tables exist
- [ ] Test deal submission
- [ ] Test points awarding
- [ ] Test reporting feature
- [ ] Test rate limiting
- [ ] Enable email verification in Supabase Auth settings
- [ ] Monitor flagged_content table for abuse patterns

---

**Last Updated**: October 1, 2025
**Version**: 1.0.0
**Author**: SnapADeal Team

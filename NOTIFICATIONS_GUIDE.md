# Push Notifications Setup Guide

## Overview

The app now supports location-based push notifications for deals. Users can enable notifications and will receive alerts when new deals are posted in their selected area (City, Province, or All Canada).

## What Was Implemented

### 1. User Interface (UnifiedMenu)
- **"Enable Push Notifications" toggle** in the Deal Alerts section
- Loads saved preferences on menu open
- Shows hint text: "Get notified about new deals in your area"

### 2. Notification Service (notifications.ts)
- **Expo Notifications integration** for push tokens
- **Location matching logic** - filters notifications by:
  - City level (exact city match)
  - Province level (province match)
  - Country level (all Canada)
- **Supabase Edge Function integration** to send actual push notifications
- Saves push tokens to the database

### 3. Deal Posting (SnapDealScreen)
- Automatically triggers notification check when a deal is posted
- Finds all users with matching location preferences
- Sends push notifications to eligible users

### 4. Supabase Edge Function
- Created `send-push-notification` function in `/supabase/functions/`
- Sends notifications via Expo's Push API
- Handles errors gracefully

## How It Works (User Flow)

### Setup:
1. User opens the menu (hamburger icon)
2. Scrolls to "Deal Alerts & Notifications" section
3. Toggles "Deal Alerts" ON
4. Toggles "Enable Push Notifications" ON
   - App requests notification permission
   - Gets Expo push token
   - Saves token to database
5. Enables GPS and selects notification area:
   - "City Only" - Only deals in their city
   - "Province" - Deals in their province
   - "All Canada" - All deals across Canada
6. Location is saved to `notification_preferences` table

### When Deal Is Posted:
1. User A posts a deal: "50% off iPhone at Best Buy Toronto"
2. System calls `checkDealNotificationTriggers(deal)`
3. Finds all users with:
   - `push_enabled = true`
   - `deal_alerts_enabled = true`
   - Location matches based on their `notification_area` setting
4. For each matching user:
   - Calls Supabase Edge Function
   - Edge Function sends push via Expo API
   - User B receives: "🔥 New Deal Alert! 50% off iPhone at Best Buy"
5. User B taps notification → Opens app to deal

## Database Schema

### notification_preferences table
```sql
- user_id (uuid)
- push_enabled (boolean)
- deal_alerts_enabled (boolean)
- proximity_enabled (boolean)
- preferred_locations (jsonb array)
  [{ id, city, province, latitude, longitude, radius }]
- notification_area (text) - 'city' | 'province' | 'canada'
```

### users table
```sql
- push_token (text) - Expo push token
```

### notification_triggers table
```sql
- user_id (uuid)
- deal_id (uuid)
- trigger_type (text)
- sent_at (timestamp)
```

## Setup Requirements

### 1. Install Dependencies ✅
```bash
npm install expo-notifications expo-device
```

### 2. Deploy Supabase Edge Function
```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-push-notification
```

### 3. Update Expo Project ID
Edit `src/services/notifications.ts` line 72:
```ts
projectId: 'your-expo-project-id', // Replace with your actual Expo project ID
```

To get your Expo project ID:
- Run `npx expo config --type introspect`
- Or check `app.json` for `extra.eas.projectId`

### 4. Test on Physical Device
**Important**: Push notifications only work on physical devices, not simulators/emulators.

## Testing

### Test Push Notification Setup:
1. Open app on physical device
2. Open menu → Deal Alerts
3. Toggle "Enable Push Notifications"
4. Should see permission prompt
5. Check console for: "Expo Push Token: ExponentPushToken[...]"

### Test Notification Flow:
1. User A: Enable notifications, set location to "Toronto", area "City"
2. User B: Post a deal with location "Toronto"
3. User A should receive push notification

## Troubleshooting

### "Push notifications only work on physical devices"
- This is expected. Use a real phone, not an emulator.

### "Permission Denied"
- User must grant notification permission in device settings
- On Android: Settings → Apps → SnapADeal → Notifications → Allow
- On iOS: Settings → SnapADeal → Notifications → Allow

### "No push token for user"
- User hasn't enabled push notifications yet
- Check `users` table for `push_token` column

### Edge Function Not Working
- Verify function is deployed: `supabase functions list`
- Check function logs: `supabase functions logs send-push-notification`
- Test locally: `supabase functions serve`

## Location Filtering Logic

```ts
if (notificationArea === 'city') {
  // Exact city match (case-insensitive)
  if (deal.city !== user.location.city) return false;
}
else if (notificationArea === 'province') {
  // Province match
  if (deal.province !== user.location.province) return false;
}
else if (notificationArea === 'canada') {
  // All deals in Canada - no filtering
}
```

## Future Enhancements

Potential improvements (not currently implemented):
- Filter by categories (e.g., only "Electronics" deals)
- Filter by stores (e.g., only "Best Buy" deals)
- Filter by keywords (e.g., only deals with "iPhone")
- Minimum discount percentage filter
- Maximum price filter
- Notification scheduling (quiet hours)

## Code References

Key files modified:
- `src/components/UnifiedMenu.tsx` - UI for enable/disable toggle
- `src/services/notifications.ts` - Core notification logic
- `src/screens/SnapDealScreen.tsx` - Trigger notifications on deal post
- `supabase/functions/send-push-notification/index.ts` - Edge Function
- `src/types/index.ts` - NotificationPreferences interface

## Notes

- Notifications are sent in real-time when deals are posted
- Only works for community-posted deals (not Flipp deals)
- Location must be set for filtering to work
- System gracefully handles errors (won't block deal posting if notifications fail)

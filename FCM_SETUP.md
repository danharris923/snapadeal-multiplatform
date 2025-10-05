# Firebase Cloud Messaging (FCM) Setup Guide

## Overview

The FCM branch implements Firebase Cloud Messaging for push notifications instead of Expo's push service. This provides better reliability and scalability for production apps.

## What's Implemented ✅

- ✅ Firebase packages installed (`@react-native-firebase/app`, `@react-native-firebase/messaging`)
- ✅ Notification service updated to use FCM
- ✅ Android manifest configured for FCM
- ✅ Supabase Edge Function updated to send via FCM API
- ✅ Location-based notification filtering
- ✅ FCM APK built and ready: `SnapADeal_20251005_1034-fcm.apk`

## Setup Steps Required

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "SnapADeal" or similar
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Add Android App to Firebase

1. In your Firebase project, click the Android icon
2. Enter package name: `com.snapsavern`
3. Enter app nickname: "SnapADeal"
4. Skip the SHA-1 for now (you can add later for advanced features)
5. Click "Register app"

### 3. Download google-services.json

1. Firebase will provide a `google-services.json` file
2. Download it
3. Place it in: `android/app/google-services.json`

### 4. Get Firebase Server Key

1. In Firebase Console, go to Project Settings (gear icon)
2. Click "Cloud Messaging" tab
3. Under "Cloud Messaging API (Legacy)", enable it if disabled
4. Copy the "Server key" (starts with `AAAA...`)

### 5. Set Firebase Server Key in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dvmxepugxqrwehycdjou
2. Go to Settings → Edge Functions
3. Add a new secret:
   - Name: `FIREBASE_SERVER_KEY`
   - Value: (paste your Firebase server key)
4. Click "Add secret"

### 6. Rebuild the App

```bash
# Clean old build
cd android
./gradlew clean

# Build new APK
cd ..
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
cd android && ./gradlew assembleRelease
```

## Testing Push Notifications

Push notifications **only work on physical devices**, not emulators.

1. Install the APK on a real Android device
2. Open the app and sign in
3. Go to menu → Deal Alerts & Notifications
4. Toggle "Deal Alerts" ON
5. Toggle "Enable Push Notifications" ON
6. Enable GPS and set your location
7. Post a deal from another account in the same location
8. You should receive a push notification!

## How It Works

### User Flow:
1. User enables push notifications in the app
2. App requests FCM token from Firebase
3. Token is saved to Supabase `users` table (`push_token` column)
4. When someone posts a deal:
   - App calls `checkDealNotificationTriggers(deal)`
   - Finds all users with matching location preferences
   - Calls Supabase Edge Function with user's FCM token
   - Edge Function sends push via Firebase Cloud Messaging API
   - User receives notification on their device

### Notification Filtering:
- **City**: Only notify for deals in the same city
- **Province**: Notify for deals in the same province
- **All Canada**: Notify for all deals

## Files Modified (FCM Branch)

- `src/services/notifications.ts` - Uses Firebase instead of Expo
- `android/app/src/main/AndroidManifest.xml` - FCM permissions and services
- `supabase/functions/send-push-notification/index.ts` - Sends via FCM API
- `package.json` - Added Firebase packages

## Troubleshooting

### "Firebase configuration missing"
- Make sure you've set the `FIREBASE_SERVER_KEY` in Supabase Edge Function secrets

### "google-services.json not found"
- Download it from Firebase Console and place in `android/app/`

### No notifications received
- Test on a physical device, not emulator
- Check that push_token exists in database for the user
- Check Supabase Edge Function logs
- Verify Firebase Server Key is correct

## Comparison: Expo vs FCM

| Feature | Expo Push | Firebase FCM |
|---------|-----------|--------------|
| Setup Complexity | Easy | Medium |
| Reliability | Good | Excellent |
| Scale | Small-Medium | Enterprise |
| Rate Limits | Lower | Higher |
| Account Required | Optional | Yes (Firebase) |
| Production Ready | Yes | Yes ✅ |

## Current Branch Status

- **Branch**: `fcm`
- **APK**: `SnapADeal_20251005_1034-fcm.apk`
- **Status**: Ready to test (needs Firebase setup)
- **Main Branch**: Still uses Expo push notifications

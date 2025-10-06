# Firebase Cloud Messaging Setup - SnapADeal

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Firebase Project

1. Go to: https://console.firebase.google.com/
2. Click **"Add project"**
3. Project name: `SnapADeal`
4. **Disable** Google Analytics (not needed)
5. Click **"Create project"**

### Step 2: Add Android App

1. Click the **Android icon** ⚙️
2. **Package name**: `com.snapadeal` ⚠️ (IMPORTANT: use this exact name)
3. **App nickname**: `SnapADeal`
4. **Skip** SHA-1 (not needed for push notifications)
5. Click **"Register app"**

### Step 3: Download Configuration File

1. Firebase will show a **`google-services.json`** file
2. Click **"Download google-services.json"**
3. Place it here: `android/app/google-services.json`
   ```bash
   # The file should be at:
   C:\Users\dan\Desktop\mobileapp\SnapSaveRN\android\app\google-services.json
   ```

### Step 4: Get Firebase Server Key

1. In Firebase Console, click **⚙️ Settings** → **Project Settings**
2. Go to **"Cloud Messaging"** tab
3. Under **"Cloud Messaging API (Legacy)"**:
   - If it says "Disabled", click **"Enable"**
   - Copy the **"Server key"** (starts with `AAAA...`)
   - Keep this safe - you'll need it for Step 5

### Step 5: Configure Supabase Edge Function

1. Go to: https://supabase.com/dashboard/project/dvmxepugxqrwehycdjou
2. Click **Settings** → **Edge Functions**
3. Click **"Add new secret"**
4. Enter:
   - **Name**: `FIREBASE_SERVER_KEY`
   - **Value**: (paste the server key from Step 4)
5. Click **"Add secret"**

### Step 6: Rebuild App (After adding google-services.json)

```bash
# Build with Firebase configuration
cd android && ./gradlew assembleRelease --no-daemon
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## ✅ Current Status

- ✅ Firebase packages installed
- ✅ FCM notification service implemented
- ✅ Android manifest configured
- ✅ Supabase Edge Function ready
- ✅ Package name: `com.snapadeal`
- ⏳ **NEEDS**: `google-services.json` file
- ⏳ **NEEDS**: Firebase Server Key in Supabase

---

## 📱 Testing Push Notifications

**Important**: Push notifications **ONLY work on physical Android devices**, not emulators!

1. **Install APK** on a real Android phone
2. **Open app** and sign in
3. **Enable notifications**:
   - Go to Menu → Deal Alerts & Notifications
   - Toggle **"Deal Alerts"** ON
   - Toggle **"Enable Push Notifications"** ON
4. **Set location**:
   - Enable GPS on your phone
   - The app will detect your location
5. **Test**:
   - Post a deal from another account in the same city
   - You should receive a push notification! 🎉

---

## 🔧 How It Works

### Notification Flow:

1. User enables push notifications in app
2. App requests FCM token from Firebase
3. Token saved to `users.push_token` in Supabase
4. When someone posts a deal:
   ```
   User posts deal
     ↓
   checkDealNotificationTriggers(deal)
     ↓
   Find users with matching location preferences
     ↓
   Call Supabase Edge Function with FCM token
     ↓
   Edge Function → Firebase → User's phone 📱
   ```

### Location Filtering:
- **City**: Notify users in the same city only
- **Province**: Notify users in the same province
- **All Canada**: Notify all users across Canada

---

## 🐛 Troubleshooting

### Build fails: "google-services.json not found"
→ Download from Firebase Console and place in `android/app/`

### "FIREBASE_SERVER_KEY not configured"
→ Add server key to Supabase Edge Function secrets (Step 5)

### No notifications received
→ Must test on **physical device** (not emulator)
→ Check `push_token` exists in database for user
→ Verify Firebase Server Key is correct

### App crashes on launch after adding Firebase
→ Make sure `google-services.json` package name is `com.snapadeal`
→ Rebuild: `cd android && ./gradlew clean && ./gradlew assembleRelease`

---

## 📦 Files Modified (FCM Branch)

- `src/services/notifications.ts` - Firebase FCM implementation
- `android/app/src/main/AndroidManifest.xml` - FCM permissions
- `android/app/build.gradle` - Firebase plugin
- `supabase/functions/send-push-notification/index.ts` - FCM API
- `package.json` - Firebase packages

---

## 🎯 Next Steps

1. **Create Firebase project** (Steps 1-4 above)
2. **Download google-services.json** and place in `android/app/`
3. **Set Firebase Server Key** in Supabase
4. **Rebuild APK**
5. **Test on physical device**

---

## Current Branch: `fcm`

Latest APK: `SnapADeal_20251005_1940-snapadeal.apk` (with package rename)

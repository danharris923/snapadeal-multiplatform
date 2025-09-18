# SnapSave React Native Build Guide

## Project Overview

This project is a complete conversion of the SnapSave Next.js app to **native React Native**. It includes all the core features from the original web app:

- **User Authentication** via Supabase
- **Deal Card System** with voting and community features
- **Camera Integration** for taking photos of deals
- **Location Services** for finding local deals
- **Flipp API Integration** for retailer deals
- **Modern UI** with teal/yellow/pink theme

## Prerequisites

Before building the app, ensure you have:

### Android Development Environment
1. **Android Studio** installed with SDK
2. **Java Development Kit (JDK)** - version 17 recommended
3. **Android SDK** with the following components:
   - Android 13 (API level 33) or higher
   - Android SDK Build-Tools
   - Android Emulator or physical device

### React Native Environment
1. **Node.js** version 20 or higher
2. **npm** or **yarn**
3. **React Native CLI**

## Setup Instructions

### 1. Install Dependencies
```bash
cd SnapSaveRN
npm install
```

### 2. Android Setup
```bash
# For Windows, ensure Android SDK is in PATH
set ANDROID_HOME=C:\\Users\\%USERNAME%\\AppData\\Local\\Android\\Sdk
set PATH=%PATH%;%ANDROID_HOME%\\platform-tools;%ANDROID_HOME%\\tools

# For macOS/Linux
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

### 3. Verify Setup
```bash
npx react-native doctor
```

### 4. Start Metro Bundler
```bash
npm start
```

### 5. Run on Android
```bash
# With device/emulator connected
npm run android
```

## Project Structure

```
src/
├── components/         # Reusable React Native components
│   └── DealCard.tsx   # Main deal display component
├── screens/           # App screens/pages
│   ├── HomeScreen.tsx # Main deals feed
│   ├── AuthScreen.tsx # Login/signup
│   └── SnapDealScreen.tsx # Deal submission
├── services/          # External service integrations
│   ├── supabase.ts    # Database and auth
│   ├── api.ts         # Flipp API integration
│   ├── camera.ts      # Camera functionality
│   └── location.ts    # GPS and location
├── utils/
│   └── theme.ts       # App styling and colors
└── types/
    └── index.ts       # TypeScript definitions
```

## Key Features Implemented

### 1. Authentication System
- Email/password authentication via Supabase
- Persistent login sessions
- Protected routes and screens

### 2. Deal Management
- Community-submitted deals with voting system
- Flipp API integration for retailer deals
- Real-time deal updates
- Image upload support

### 3. Native Features
- **Camera Integration**: Take photos of deals using device camera
- **Photo Library**: Select existing photos from device
- **Location Services**: Get user location for local deals
- **Native Permissions**: Proper Android permission handling

### 4. UI/UX
- Native Android Material Design components
- Custom theme system with brand colors
- Responsive grid layouts
- Pull-to-refresh functionality
- Infinite scroll loading

## Android Permissions

The app requires the following permissions (configured in AndroidManifest.xml):

```xml
<!-- Camera access for deal photos -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Storage access for photo library -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Location access for local deals -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Network access -->
<uses-permission android:name="android.permission.INTERNET" />
```

## Build Commands

### Debug Build
```bash
npm run android
```

### Release Build
```bash
cd android
./gradlew assembleRelease
```

### Generate APK
```bash
cd android
./gradlew bundleRelease
```

## Troubleshooting

### Common Issues

1. **Gradle Build Failed**
   - Ensure Android SDK is properly installed
   - Check ANDROID_HOME environment variable
   - Clean project: `cd android && ./gradlew clean`

2. **Metro Bundler Issues**
   - Clear cache: `npx react-native start --reset-cache`
   - Delete node_modules and reinstall

3. **Permission Issues**
   - Check AndroidManifest.xml has required permissions
   - Test permissions on physical device

4. **Navigation Errors**
   - Ensure React Navigation is properly installed
   - Check navigation prop types

## Environment Variables

Create a `.env` file with:

```env
SUPABASE_URL=https://dvmxepugxqrwehycdjou.supabase.co
SUPABASE_ANON_KEY=your_supabase_key_here
```

## Performance Optimizations

- **Image Optimization**: Images are resized before upload
- **Lazy Loading**: Deal cards load incrementally
- **Caching**: Location and user data cached locally
- **Native Components**: Using native Android components for performance

## Deployment

### Google Play Store
1. Generate signed APK/AAB
2. Create Google Play Console account
3. Upload and configure app listing
4. Submit for review

### Testing
- Test on multiple Android versions
- Verify all permissions work correctly
- Test network connectivity edge cases
- Validate camera and location features

## Next Steps

1. **Add iOS Support**: Extend to iOS platform
2. **Push Notifications**: Real-time deal alerts
3. **Offline Support**: Cache deals for offline viewing
4. **Analytics**: Track user engagement
5. **Social Features**: User profiles and following

This React Native app provides a fully native mobile experience while maintaining all the functionality of the original Next.js web application.
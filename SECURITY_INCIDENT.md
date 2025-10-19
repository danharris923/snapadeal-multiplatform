# 🚨 SECURITY INCIDENT - IMMEDIATE ACTION REQUIRED

**Date Detected:** October 19, 2025
**Severity:** CRITICAL
**Status:** Secrets exposed in public repository

## Exposed Secrets

The following secrets were committed to the public GitHub repository and must be rotated immediately:

### 1. Google Cloud Service Account Key
- **File:** `snapadeal-66935-2d2de6a77dde.json`
- **Risk:** Full admin access to Firebase project
- **Action Required:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Navigate to IAM & Admin > Service Accounts
  3. Find `firebase-adminsdk-fbsvc@snapadeal-66935.iam.gserviceaccount.com`
  4. Delete the key with ID `2d2de6a77ddebece83855cb48695b6283b0474df`
  5. Create a new service account key
  6. Download it and store locally (DO NOT commit to git)

### 2. Supabase Service Role Key
- **Files:** `simpleStorageFix.js`, `fixStoragePolicy.js`
- **Exposed Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Project:** `dvmxepugxqrwehycdjou.supabase.co`
- **Risk:** Full database access, expires in 2042
- **Action Required:**
  1. Go to [Supabase Dashboard](https://app.supabase.com/)
  2. Navigate to Project Settings > API
  3. Click "Reset service_role key"
  4. Update your `.env` file with the new key
  5. Redeploy any services using this key

### 3. Firebase google-services.json (Android)
- **Location:** `android/app/google-services.json` (on android branch)
- **Risk:** Medium - Contains API keys for Firebase services
- **Action Required:**
  1. Rotate Firebase API keys in [Firebase Console](https://console.firebase.google.com/)
  2. Download new `google-services.json`
  3. Place in `android/app/` locally (already in .gitignore)

## Remediation Steps Completed

- ✅ Removed secret files from repository
- ✅ Added comprehensive .gitignore rules
- ✅ Created .env.example template
- ✅ Documented security incident

## Prevention Measures Implemented

1. **Updated .gitignore** to block:
   - Service account JSON files
   - google-services.json / GoogleService-Info.plist
   - Scripts with hardcoded credentials
   - .env files

2. **Environment Variables**: Use `.env` for all secrets going forward

3. **Pre-commit Checks**: Consider adding git-secrets or similar tools

## Next Steps for Repository Owner

1. **ROTATE ALL EXPOSED SECRETS IMMEDIATELY** (see actions above)
2. Review Supabase logs for unauthorized access
3. Review Firebase/Google Cloud logs for suspicious activity
4. Enable 2FA on all cloud accounts
5. Consider enabling branch protection rules
6. Set up secret scanning alerts in GitHub

## Git History Note

**IMPORTANT:** These secrets exist in git history. Simply removing files doesn't erase them from history. Consider:
- Using `git filter-repo` or BFG Repo-Cleaner to remove from history
- OR creating a new repository with clean history (recommended for simplicity)

## Contact

If you notice any suspicious activity, immediately:
1. Revoke all compromised credentials
2. Review access logs
3. Contact Anthropic security team if needed

# Supabase Edge Functions

## Setup

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

## Deploy Edge Function

Deploy the send-push-notification function:
```bash
supabase functions deploy send-push-notification
```

## Test Locally

Run the function locally for testing:
```bash
supabase functions serve send-push-notification --no-verify-jwt
```

## Test the Function

Test with curl:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-push-notification' \
  --header 'Content-Type: application/json' \
  --data '{"pushToken":"ExponentPushToken[xxxxx]","title":"Test","body":"Testing notifications"}'
```

## Environment Variables

No environment variables are currently required. The function uses Expo's public push notification API.

## Notes

- The function sends notifications via Expo's Push Notification service
- Expo Push Tokens start with "ExponentPushToken["
- The function is called automatically when users post deals that match other users' notification preferences

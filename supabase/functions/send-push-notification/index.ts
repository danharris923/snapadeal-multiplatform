import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Helper function to get OAuth2 access token for Firebase
async function getAccessToken(serviceAccount: any): Promise<string> {
  const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))

  const now = Math.floor(Date.now() / 1000)
  const jwtClaimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }
  const jwtClaimSetEncoded = btoa(JSON.stringify(jwtClaimSet))

  const signatureInput = `${jwtHeader}.${jwtClaimSetEncoded}`

  // Import the private key
  const pemHeader = "-----BEGIN PRIVATE KEY-----"
  const pemFooter = "-----END PRIVATE KEY-----"
  const pemContents = serviceAccount.private_key
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "")

  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signatureInput)
  )

  const jwtSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const jwt = `${jwtHeader}.${jwtClaimSetEncoded}.${jwtSignature}`

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  })

  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

serve(async (req) => {
  try {
    const { pushToken, title, body, data } = await req.json()

    if (!pushToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Push token is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Firebase Service Account from environment variable
    const firebaseServiceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
    if (!firebaseServiceAccountJson) {
      console.error('FIREBASE_SERVICE_ACCOUNT environment variable not set')
      return new Response(
        JSON.stringify({ success: false, error: 'Firebase configuration missing. Please set FIREBASE_SERVICE_ACCOUNT in Supabase Edge Function secrets.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const serviceAccount = JSON.parse(firebaseServiceAccountJson)
    const projectId = serviceAccount.project_id

    // Get OAuth2 access token
    const accessToken = await getAccessToken(serviceAccount)

    // Send to Firebase Cloud Messaging API v1
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`

    const response = await fetch(fcmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: pushToken,
          notification: {
            title: title || 'New Notification',
            body: body || '',
          },
          data: data || {},
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channel_id: 'deal-alerts',
            }
          }
        }
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('FCM API v1 error:', result)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send notification', details: result }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in send-push-notification function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    // Get Firebase Server Key from environment variable
    const firebaseServerKey = Deno.env.get('FIREBASE_SERVER_KEY')
    if (!firebaseServerKey) {
      console.error('FIREBASE_SERVER_KEY environment variable not set')
      return new Response(
        JSON.stringify({ success: false, error: 'Firebase configuration missing. Please set FIREBASE_SERVER_KEY in Supabase Edge Function secrets.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Send to Firebase Cloud Messaging (FCM) API
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${firebaseServerKey}`,
      },
      body: JSON.stringify({
        to: pushToken,
        notification: {
          title: title || 'New Notification',
          body: body || '',
          sound: 'default',
          priority: 'high',
        },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'deal-alerts',
            sound: 'default',
          }
        }
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('FCM API error:', result)
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

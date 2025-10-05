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

    // Send to Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        title: title || 'New Notification',
        body: body || '',
        data: data || {},
        sound: 'default',
        priority: 'high',
        channelId: 'deal-alerts',
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Expo Push API error:', result)
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

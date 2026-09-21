import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { syncUser, markUserDeleted } from '@/lib/users'

export async function POST(request) {
  let event
  try {
    event = await verifyWebhook(request)
  } catch (error) {
    console.error('Clerk webhook verification failed:', error)
    return new Response('Verification failed', { status: 400 })
  }

  try {
    if (event.type === 'user.created') {
      await syncUser(event.data.id)
    } else if (event.type === 'user.updated') {
      await syncUser(event.data.id)
    } else if (event.type === 'user.deleted' && event.data.id) {
      await markUserDeleted(event.data.id)
    }
  } catch (error) {
    console.error('Clerk user sync failed:', error)
    return new Response('User sync failed', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}

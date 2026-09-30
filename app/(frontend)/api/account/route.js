import { auth, clerkClient } from '@clerk/nextjs/server'
import { markUserDeleted } from '@/lib/users'
import { revokeDesktopSessionsForUser } from '@/lib/desktop-auth'

export async function DELETE(request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Please sign in to manage this account.' }, { status: 401 })

  let confirmation
  try {
    confirmation = (await request.json()).confirmation
  } catch {
    return Response.json({ error: 'Please confirm account deletion.' }, { status: 400 })
  }

  if (confirmation !== 'DELETE') {
    return Response.json({ error: 'Please type DELETE to confirm account deletion.' }, { status: 400 })
  }

  try {
    await revokeDesktopSessionsForUser(userId)
    await (await clerkClient()).users.deleteUser(userId)
  } catch (error) {
    console.error('Account deletion failed:', error)
    return Response.json({ error: 'We couldn’t delete your account. Please try again or contact support.' }, { status: 503 })
  }

  try {
    await markUserDeleted(userId)
  } catch (error) {
    console.error('Could not mark the deleted account in Cutly records:', error)
  }

  return Response.json({ success: true })
}

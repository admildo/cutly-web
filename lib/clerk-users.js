import { clerkClient } from '@clerk/nextjs/server'

// Only an exact, single match is accepted, so a typo can never land on someone else.
export const findClerkUserByEmail = async (email) => {
  const { data } = await (await clerkClient()).users.getUserList({ emailAddress: [email], limit: 2 })
  if (data.length !== 1) return null
  const [user] = data
  const primary = user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)
  return {
    id: user.id,
    email: primary?.emailAddress || email,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
    emailVerified: primary?.verification?.status === 'verified'
  }
}

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

// Names and emails for a set of user IDs, as a map. An ID Clerk no longer knows is simply absent.
export const findClerkUsersByIds = async (ids) => {
  const unique = [...new Set(ids)].slice(0, 100)
  if (unique.length === 0) return new Map()
  const { data } = await (await clerkClient()).users.getUserList({ userId: unique, limit: unique.length })
  return new Map(
    data.map((user) => {
      const primary = user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)
      return [user.id, { email: primary?.emailAddress || null, name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null }]
    })
  )
}

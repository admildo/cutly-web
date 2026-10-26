import { clerkClient } from '@clerk/nextjs/server'

const summarize = (user) => {
  const primary = user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)
  return {
    id: user.id,
    email: primary?.emailAddress || null,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
    emailVerified: primary?.verification?.status === 'verified'
  }
}

// Only an exact, single match is accepted, so a typo can never land on someone else.
export const findClerkUserByEmail = async (email) => {
  const { data } = await (await clerkClient()).users.getUserList({ emailAddress: [email], limit: 2 })
  if (data.length !== 1) return null
  const user = summarize(data[0])
  return { ...user, email: user.email || email }
}

// Names and emails for many user IDs, as a map keyed by ID. Requests go out 100 IDs at a time.
export const findClerkUsersByIds = async (ids) => {
  const unique = [...new Set(ids)]
  const clerk = await clerkClient()
  const people = new Map()
  for (let start = 0; start < unique.length; start += 100) {
    const batch = unique.slice(start, start + 100)
    const { data } = await clerk.users.getUserList({ userId: batch, limit: batch.length })
    for (const user of data) people.set(user.id, summarize(user))
  }
  return people
}

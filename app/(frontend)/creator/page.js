import { auth } from '@clerk/nextjs/server'
import { CreatorProgram } from '@/app/components/CreatorProgram'
import { createPageMetadata, socialImage } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Creator program',
  description: 'Apply for a free Deyn Studio license and usage credits. Create an account, then apply from your dashboard.',
  path: '/creator',
  image: socialImage('creator', 'Deyn Studio creator program: a free license and AI usage credits for selected creators')
})

export default async function CreatorProgramPage() {
  const { userId } = await auth()
  return <CreatorProgram isSignedIn={Boolean(userId)} />
}

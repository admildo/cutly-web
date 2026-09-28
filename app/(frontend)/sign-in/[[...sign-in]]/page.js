import { SignIn } from '@clerk/nextjs'

export const metadata = { title: 'Sign in', robots: { index: false, follow: false } }

export default function SignInPage() {
  return <SignIn forceRedirectUrl="/desktop-auth" routing="hash" />
}

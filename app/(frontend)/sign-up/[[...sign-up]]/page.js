import { SignUp } from '@clerk/nextjs'

export const metadata = { title: 'Create account', robots: { index: false, follow: false } }

export default function SignUpPage() {
  return <SignUp forceRedirectUrl="/desktop-auth" routing="hash" />
}

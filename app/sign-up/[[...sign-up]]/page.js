import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return <SignUp forceRedirectUrl="/desktop-auth" routing="hash" />
}

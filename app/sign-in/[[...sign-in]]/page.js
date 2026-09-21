import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return <SignIn forceRedirectUrl="/desktop-auth" routing="hash" />
}

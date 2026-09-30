import { AuthForm } from '../../components/AuthForm'
import { AuthLayout } from '../../components/AuthLayout'
import { normalizeInternalReturnPath } from '@/lib/auth-redirect'

export const metadata = { title: 'Sign in', robots: { index: false, follow: false } }

export default async function SignInPage({ searchParams }) {
  const params = await searchParams
  const returnTo = normalizeInternalReturnPath(params?.returnTo || params?.redirect_url)

  return (
    <AuthLayout>
      <AuthForm mode="sign-in" returnTo={returnTo} />
    </AuthLayout>
  )
}

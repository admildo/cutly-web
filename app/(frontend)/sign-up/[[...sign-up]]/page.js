import { AuthForm } from '../../components/AuthForm'
import { AuthLayout } from '../../components/AuthLayout'
import { normalizeInternalReturnPath } from '@/lib/auth-redirect'

export const metadata = { title: 'Create account', robots: { index: false, follow: false } }

export default async function SignUpPage({ searchParams }) {
  const params = await searchParams
  const returnTo = normalizeInternalReturnPath(params?.returnTo || params?.redirect_url)

  return (
    <AuthLayout>
      <AuthForm mode="sign-up" returnTo={returnTo} />
    </AuthLayout>
  )
}

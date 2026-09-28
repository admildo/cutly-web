import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' }
]

if (process.env.NODE_ENV === 'production') {
  securityHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000' })
}

const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  }
}

export default withPayload(nextConfig)

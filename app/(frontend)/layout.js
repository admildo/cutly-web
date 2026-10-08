import { Geist_Mono, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ClerkProvider } from "@clerk/nextjs";
import { defaultSocialImage, siteOrigin, siteUrl, serializeJsonLd } from '@/lib/seo'
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: siteUrl,
  applicationName: 'Deyn Studio',
  icons: {
    icon: [
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon/favicon.ico', sizes: 'any' }
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  manifest: '/favicon/site.webmanifest',
  title: {
    default: 'AI Video Clip Maker for Desktop | Deyn Studio',
    template: '%s | Deyn Studio'
  },
  description: 'Turn long videos into shareable clips with Deyn Studio. Find standout moments with AI, then add captions, reframe, and export from one desktop app.',
  creator: 'Deyn Studio',
  publisher: 'Deyn Studio',
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Deyn Studio',
    locale: 'en_US',
    title: 'AI Video Clip Maker for Desktop | Deyn Studio',
    description: 'Turn long videos into shareable clips with Deyn Studio. Find standout moments with AI, then add captions, reframe, and export from one desktop app.',
    images: [defaultSocialImage]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video Clip Maker for Desktop | Deyn Studio',
    description: 'Turn long videos into shareable clips with Deyn Studio. Find standout moments with AI, then add captions, reframe, and export from one desktop app.',
    images: [defaultSocialImage.url]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#08090c',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${geistMono.variable} bg-[#08090c] font-sans text-[#f2f0ef] antialiased`}
        style={{
          '--font-dm-sans': 'var(--font-manrope)',
          '--font-instrument-serif': 'var(--font-manrope)',
          '--font-geist-sans': 'var(--font-manrope)',
          '--font-serif': 'var(--font-manrope)'
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${siteOrigin}/#organization`,
                  name: 'Deyn Studio',
                  url: siteOrigin,
                  logo: {
                    '@type': 'ImageObject',
                    url: new URL('/favicon/web-app-manifest-512x512.png', siteUrl).toString(),
                    width: 512,
                    height: 512
                  }
                },
                {
                  '@type': 'WebSite',
                  '@id': `${siteOrigin}/#website`,
                  name: 'Deyn Studio',
                  url: siteOrigin,
                  description: 'Desktop software for finding moments in long videos, editing captions and framing, and exporting clips.',
                  publisher: { '@id': `${siteOrigin}/#organization` },
                  inLanguage: 'en'
                }
              ]
            })
          }}
        />
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" dynamic>{children}</ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}

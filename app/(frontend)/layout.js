import { Geist_Mono, Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { siteOrigin, siteUrl, serializeJsonLd } from '@/lib/seo'
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
  title: {
    default: 'Deyn Studio — Desktop Clip Editor',
    template: '%s | Deyn Studio'
  },
  description: 'Find the best moments in long videos, add captions and portrait framing, and export clips with Deyn Studio for desktop.',
  keywords: ['desktop clip editor', 'video clips', 'video captions', 'portrait video framing', 'local transcription', 'media tools'],
  creator: 'Deyn Studio',
  publisher: 'Deyn Studio',
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Deyn Studio',
    locale: 'en_US',
    title: 'Deyn Studio — Desktop Clip Editor',
    description: 'Find the best moments in long videos, add captions and portrait framing, and export clips with Deyn Studio for desktop.',
    images: [{ url: '/cutly-hero-moon.png', width: 1672, height: 941, alt: 'Deyn Studio desktop app showing a video clip workflow' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deyn Studio — Desktop Clip Editor',
    description: 'Find the best moments in long videos, add captions and portrait framing, and export clips with Deyn Studio for desktop.',
    images: ['/cutly-hero-moon.png']
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${geistMono.variable} bg-[#f7f7f5] font-sans text-[#171717] antialiased`}
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
            __html: serializeJsonLd([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Deyn Studio',
                url: siteOrigin
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Deyn Studio',
                url: siteOrigin,
                description: 'Desktop software for finding moments in long videos, editing captions and framing, and exporting clips.'
              }
            ])
          }}
        />
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" dynamic>{children}</ClerkProvider>
      </body>
    </html>
  );
}

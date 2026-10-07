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
    default: 'Deyn Studio — Desktop Media Workspace',
    template: '%s | Deyn Studio'
  },
  description: 'Edit and automate media with Deyn Studio, a desktop workspace for assistant-guided workflows, video, audio, images, and documents.',
  keywords: ['desktop media editor', 'media editing automation', 'video editor', 'audio tools', 'image tools', 'PDF utilities'],
  creator: 'Deyn Studio',
  publisher: 'Deyn Studio',
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Deyn Studio',
    locale: 'en_US',
    title: 'Deyn Studio — Desktop Media Workspace',
    description: 'Edit and automate media with Deyn Studio, a desktop workspace for assistant-guided workflows, video, audio, images, and documents.',
    images: [{ url: '/cutly-hero-moon.png', width: 1672, height: 941, alt: 'Deyn Studio desktop media workspace' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deyn Studio — Desktop Media Workspace',
    description: 'Edit and automate media with Deyn Studio, a desktop workspace for assistant-guided workflows, video, audio, images, and documents.',
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
                description: 'Desktop software for assistant-guided media editing, video, audio, image, and document workflows.'
              }
            ])
          }}
        />
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" dynamic>{children}</ClerkProvider>
      </body>
    </html>
  );
}

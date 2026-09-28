import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { siteOrigin, siteUrl, serializeJsonLd } from '@/lib/seo'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: siteUrl,
  applicationName: 'Cutly',
  title: {
    default: 'Cutly — Desktop Video Clip Editor',
    template: '%s | Cutly'
  },
  description: 'Turn long videos into short, shareable clips with Cutly, a desktop video clip editor for creators.',
  keywords: ['video clip editor', 'video clipping software', 'short-form video', 'social media clips', 'desktop video editor'],
  creator: 'Cutly',
  publisher: 'Cutly',
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Cutly',
    locale: 'en_US',
    title: 'Cutly — Desktop Video Clip Editor',
    description: 'Turn long videos into short, shareable clips with Cutly, a desktop video clip editor for creators.',
    images: [{ url: '/cutly-hero-moon.png', width: 1672, height: 941, alt: 'Cutly desktop video clip editor' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cutly — Desktop Video Clip Editor',
    description: 'Turn long videos into short, shareable clips with Cutly, a desktop video clip editor for creators.',
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
        className={`${geistSans.variable} ${geistMono.variable} bg-[#f7f7f5] font-sans text-[#171717] antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Cutly',
                url: siteOrigin
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Cutly',
                url: siteOrigin,
                description: 'Desktop software for turning long videos into short, shareable clips.'
              }
            ])
          }}
        />
        <ClerkProvider dynamic>{children}</ClerkProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import OneSignalProvider from "./OneSignalProvider";
import { Toaster } from "@/components/ui/toaster";
import PromoBanner from "@/components/PromoBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "Plan your tommorow today",
  keywords: ["planning", "events", "schedule", "organize"],
  authors: [{ name: "plancer Team", url: "https://plancer.com" }],
  description: "Get organized with plancer, your personal event planner.",
  openGraph: {
    title: "plancer - Plan Your Tomorrow Today",
    description: "Get organized with plancer, your personal event planner. Create, manage, and attend events with ease.",
    url: "https://plancer.com",
    siteName: "plancer",
    images: [
      {
        url: "/plancer.png", // Your app logo/image
        width: 1200,
        height: 630,
        alt: "plancer - Event Planning Made Easy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plancer - Plan Your Tomorrow Today",
    description: "Get organized with Plancer, your personal event planner.",
    images: ["/plancer.png"],
  },
};
import { Analytics } from "@vercel/analytics/next"
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <html lang="en">
      <head>
        {/* SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#10B981" />
        <meta name="msapplication-TileColor" content="#10B981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Plancer" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* PWA Icons */}
        <link rel="icon" href="/favicon.ico" />
        
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.onesignal.com" />
        
        {/* DNS Prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//cdn.onesignal.com" />
        
        {/* Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Plancer",
              "description": "Smart event planning platform for creating, managing, and attending events",
              "url": "https://plancer.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "author": {
                "@type": "Organization",
                "name": "Plancer Team",
                "url": "https://plancer.com"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250",
                "bestRating": "5",
                "worstRating": "1"
              },
              "featureList": [
                "Event Creation and Management",
                "QR Code Check-ins",
                "Real-time Analytics",
                "Attendee Management",
                "Mobile Responsive Design",
                "Digital Tickets",
                "Event Registration"
              ]
            })
          }}
        />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Plancer",
              "url": "https://plancer.com",
              "logo": "https://plancer.com/plancer.png",
              "description": "Smart event planning platform",
              "sameAs": [
                "https://twitter.com/plancer",
                "https://linkedin.com/in/plancer",
                "https://github.com/plancer"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "androtechlistgroup@gmail.com"
              }
            })
          }}
        />
        
        {/* OneSignal Script */}
        <script
          src="https://cdn.onesignal.com/sdks/OneSignalSDK.js"
          defer
        ></script>
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
                `
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <OneSignalProvider>
          <PromoBanner />
          {children}
        </OneSignalProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

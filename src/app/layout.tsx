import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Footer } from "@/components/layout/footer";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/app/providers";
import { THEME_SCRIPT } from "@/components/theme/theme-provider";
import { SITE } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.subtitle} · ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "calculator",
    "scientific calculator",
    "unit converter",
    "finance calculator",
    "math tools",
    "online tools",
    "METER",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.subtitle}`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.subtitle}`,
    description: SITE.description,
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  verification: {
  google: "VlqQQceIiy9tyy0QfVexwaKbL6yuNcRhuUoOjb03vhE",
},
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f5fb" },
    { media: "(prefers-color-scheme: dark)", color: "#070b16" },
  ],
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  alternateName: `${SITE.name} ${SITE.subtitle}`,
  url: SITE.url,
  description: SITE.description,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE.url}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <Script
  src="https://pl31139608.profitableratecpmnetwork.com/54/a1/85/54a1859f85264dc8a5b1c59424c59681.js"
  strategy="afterInteractive"
/>
<Script
    src="https://pl31139609.profitableratecpmnetwork.com/20/8f/ef/208fefe2649cc1ee1ccd4bb07789424c.js"
    strategy="afterInteractive"
  />
      </head>
      <body>
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <Footer />
          <MobileTabBar />
          {/* Spacer so content clears the fixed mobile tab bar. */}
          <div className="h-16 md:hidden" aria-hidden />
        </Providers>
      </body>
    </html>
  );
}

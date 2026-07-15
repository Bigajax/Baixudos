import type { Metadata } from "next";
import { Anton, Sora } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileTabBar from "@/components/MobileTabBar";
import CookieBanner from "@/components/CookieBanner";
import IntroLoader from "@/components/IntroLoader";
import { site } from "@/content/site";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://baixudospr.com.br"), // [PLACEHOLDER] domínio real
  title: {
    default: "Baixudos.PR — Eventos e Cultura Automotiva em Maringá",
    template: "%s | Baixudos.PR",
  },
  description: site.description,
  openGraph: {
    title: "Baixudos.PR — Eventos e Cultura Automotiva em Maringá",
    description: site.description,
    type: "website",
    locale: "pt_BR",
    siteName: "Baixudos.PR",
    images: [{ url: "/images/hero-8a-edicao.jpg", width: 1080, height: 1080 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Baixudos.PR",
  description: site.description,
  url: "https://baixudospr.com.br",
  logo: "https://baixudospr.com.br/images/logo.png",
  sameAs: [site.instagram],
  address: {
    "@type": "PostalAddress",
    addressLocality: site.city,
    addressRegion: site.stateShort,
    addressCountry: "BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${sora.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-night text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <IntroLoader />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileTabBar />
        <WhatsAppButton />
        <CookieBanner />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";

import { resolveTenant } from "@/lib/tenant/resolve-tenant";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();

  const hostname =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "";

  const resolvedTenant =
    await resolveTenant(hostname);

  if (!resolvedTenant) {
    return {
      title: "Nelled Business",
      description: "Site profissional.",
    };
  }

  const { tenant, settings } =
    resolvedTenant;

  const companyName =
    settings?.company_name ??
    settings?.short_name ??
    tenant.name;

  return {
    title:
      settings?.seo_title ??
      companyName,

    description:
      settings?.seo_description ??
      settings?.hero_description ??
      settings?.slogan ??
      undefined,

    icons: settings?.favicon_url
      ? {
          icon: settings.favicon_url,
        }
      : undefined,

    openGraph: {
      title:
        settings?.seo_title ??
        companyName,

      description:
        settings?.seo_description ??
        settings?.hero_description ??
        undefined,

      siteName: companyName,

      images: settings?.hero_image_url
        ? [
            {
              url: settings.hero_image_url,
            },
          ]
        : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
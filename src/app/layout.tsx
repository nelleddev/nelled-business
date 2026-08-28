import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  Inter,
  Space_Grotesk,
} from "next/font/google";
import { headers } from "next/headers";

import { resolveTenant } from "@/lib/tenant/resolve-tenant";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
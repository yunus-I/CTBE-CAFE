import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Locale } from "@/lib/translations";
import { LocaleProvider } from "@/components/locale-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "AAU Cafe Management System",
  description: "Addis Ababa University — Digital Meal Tracking & Cafe Administration",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;

  return (
    <html lang={locale} className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ minHeight: "100vh", fontFamily: "'Roboto', 'Open Sans', Arial, sans-serif" }}>
        <LocaleProvider initialLocale={locale}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}

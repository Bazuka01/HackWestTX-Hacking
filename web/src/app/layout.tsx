import type { Metadata } from "next";
import { Raleway, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import { getLanguage } from "@/lib/serverLanguage";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConnectX",
  description: "Find student organizations and events that fit you.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const language = await getLanguage();

  return (
    <html
      lang={language}
      className={`${raleway.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLanguage={language}>{children}</LanguageProvider>
      </body>
    </html>
  );
}

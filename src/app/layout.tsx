import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/responsive.css";
import { ToastProvider } from "@/components/ui/ToastContainer";
import Header from "@/components/Header";
import { ViewTransitions } from "next-view-transitions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Immo1 - Plateforme Immobilière",
  description: "Plateforme immobilière moderne avec authentification sécurisée",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="fr" className="h-full">
      <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
          <ToastProvider>
            <Header />
        {children}
          </ToastProvider>
      </body>
    </html>
    </ViewTransitions>
  );
}

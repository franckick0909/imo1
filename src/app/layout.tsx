import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ToastProvider } from "@/components/ui/ToastContainer";
import { CartProvider } from "@/contexts/CartContext";
import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import {
  Archivo_Black,
  Geist,
  Geist_Mono,
  Inter,
  Pinyon_Script,
  Playfair_Display,
} from "next/font/google";
import "../styles/responsive.css";
import "./globals.css";

// Gestion globale des erreurs de transition
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    if (
      event.reason?.name === "AbortError" &&
      event.reason?.message?.includes("Transition was skipped")
    ) {
      // Ignorer silencieusement les erreurs de transition interrompues
      event.preventDefault();
    }
  });
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const pinyonScript = Pinyon_Script({
  variable: "--font-pinyon-script",
  subsets: ["latin"],
  weight: "400",
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
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
          className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfairDisplay.variable} ${pinyonScript.variable} ${archivoBlack.variable} antialiased h-full font-inter`}
        >
          <CartProvider>
            <ToastProvider>
              <Header />
              {children}
              <Footer />
            </ToastProvider>
          </CartProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}

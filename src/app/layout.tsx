import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/ToastContainer";
import { CartProvider } from "@/contexts/CartContext";
import { ReactLenis } from "@/utils/lenis";
import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import {
  Archivo_Black,
  Cormorant_Garamond,
  Geist,
  Geist_Mono,
  Inter,
  Luxurious_Roman,
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

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

const luxuriousRoman = Luxurious_Roman({
  variable: "--font-luxurious-roman",
  subsets: ["latin"],
  weight: "400",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
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
        <ReactLenis
          root
          options={{
            duration: 1.6, // Durée moyenne pour l'inertie
            lerp: 0.04, // 🔑 INERTIE: 0.04=max, 0.06=balanced, 0.08=minimal
            wheelMultiplier: 1.4, // Légèrement amplifié
            touchMultiplier: 3, // Beaucoup d'inertie tactile
            infinite: false,
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            syncTouch: false, // Important pour l'inertie
          }}
        >
          <body
            className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${archivoBlack.variable} ${luxuriousRoman.variable} ${cormorantGaramond.variable} antialiased h-full font-inter`}
          >
            <CartProvider>
              <ToastProvider>
                <Header />
                {children}
                <Footer />
              </ToastProvider>
            </CartProvider>
          </body>
        </ReactLenis>
      </html>
    </ViewTransitions>
  );
}

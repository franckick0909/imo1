import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/ToastContainer";
import { CartProvider } from "@/contexts/CartContext";
import { ReactLenis } from "@/utils/lenis";
import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import { Cormorant_Garamond, Inter, Luxurious_Roman } from "next/font/google";
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

// Police principale - optimisée pour le performance
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap", // Améliore les performances de chargement
  preload: true,
});

// Police décorative - chargement optimisé
const luxuriousRoman = Luxurious_Roman({
  variable: "--font-luxurious-roman",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false, // Non critique, chargé après
});

// Police pour les titres - chargement optimisé
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["400", "600"], // Poids multiples en une seule déclaration
  display: "swap",
  preload: false,
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
            duration: 1.2, // Réduit pour des transitions plus rapides
            lerp: 0.06, // Plus équilibré pour la performance
            wheelMultiplier: 1.2, // Réduit pour éviter les conflits
            touchMultiplier: 2, // Réduit pour mobile
            infinite: false,
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            syncTouch: false,
          }}
        >
          <body
            className={`${inter.variable} ${luxuriousRoman.variable} ${cormorantGaramond.variable} antialiased h-full font-inter`}
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

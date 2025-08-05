import ConditionalFooter from "@/components/layout/ConditionalFooter";
import Header from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/ToastContainer";
import { CartProvider } from "@/contexts/CartContext";
import SmoothLenis from "@/utils/SmoothLenis";
import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import {
  Archivo_Black,
  Inter,
  Luxurious_Roman,
  Metal,
  Monsieur_La_Doulaise,
} from "next/font/google";
// Import des styles avec priorité
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
  fallback: ["system-ui", "arial"],
});

// Police décorative - chargement optimisé
const luxuriousRoman = Luxurious_Roman({
  variable: "--font-luxurious-roman",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false, // Non critique, chargé après
});

// Police pour les gros titres - chargement différé
const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const monsieurLaDoulaise = Monsieur_La_Doulaise({
  variable: "--font-monsieur-la-doulaise",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const metal = Metal({
  variable: "--font-metal",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Immo1 - Cosmétiques Bio & Naturels",
  description:
    "Découvrez notre gamme de cosmétiques bio et naturels pour une beauté authentique et respectueuse de l'environnement.",
  keywords: [
    "cosmétiques bio",
    "produits naturels",
    "beauté écologique",
    "soins bio",
    "cosmétiques français",
  ],
  authors: [{ name: "Immo1" }],
  creator: "Immo1",
  publisher: "Immo1",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://immo1.com"),
  openGraph: {
    title: "Immo1 - Cosmétiques Bio & Naturels",
    description:
      "Découvrez notre gamme de cosmétiques bio et naturels pour une beauté authentique et respectueuse de l'environnement.",
    url: "https://immo1.com",
    siteName: "Immo1",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Immo1 - Cosmétiques Bio & Naturels",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Immo1 - Cosmétiques Bio & Naturels",
    description:
      "Découvrez notre gamme de cosmétiques bio et naturels pour une beauté authentique et respectueuse de l'environnement.",
    images: ["/images/hero.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <SmoothLenis>
        <body
          className={`${inter.variable} ${luxuriousRoman.variable} ${archivoBlack.variable} ${monsieurLaDoulaise.variable} ${metal.variable} font-sans antialiased`}
        >
          <ViewTransitions>
            <ToastProvider>
              <CartProvider>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <ConditionalFooter />
                </div>
              </CartProvider>
            </ToastProvider>
          </ViewTransitions>
        </body>
      </SmoothLenis>
    </html>
  );
}

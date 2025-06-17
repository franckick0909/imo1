import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Alternative plus spécifique si on veut garder ESLint mais ignorer certains dossiers
  // eslint: {
  //   dirs: ['src'], // Seulement analyser le dossier src
  //   ignoreDuringBuilds: false,
  // },
};

export default nextConfig;

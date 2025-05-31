import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Alternative plus spécifique si on veut garder ESLint mais ignorer certains dossiers
  // eslint: {
  //   dirs: ['src'], // Seulement analyser le dossier src
  //   ignoreDuringBuilds: false,
  // },
};

export default nextConfig;

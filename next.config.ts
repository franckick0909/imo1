import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisations de performance
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "@react-email/components",
    ],
  },

  // Configuration Turbopack
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // Optimisation des images
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
    formats: ["image/webp", "image/avif"], // Formats modernes optimisés
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Optimisation du build
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Optimisations runtime
  poweredByHeader: false,
  reactStrictMode: true,

  // Optimisation ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimisation webpack
  webpack: (config, { dev, isServer }) => {
    // Optimisations en production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: -10,
            chunks: "all",
          },
          framerMotion: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: "framer-motion",
            chunks: "all",
            priority: 10,
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Configurações avançadas de otimização
  reactStrictMode: true,
  poweredByHeader: false, // Security: remove X-Powered-By
  compress: true,
  eslint: {
    // Only run ESLint in dev/CI, not during Docker production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Only run type checking in dev/CI, not during Docker production builds
    ignoreBuildErrors: true,
  },

  images: {
    // Domínios permitidos para carregamento de imagens
    remotePatterns: [
      { protocol: "https", hostname: "agury.com.br" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Caso use Google Auth futuramente
      { protocol: "https", hostname: "avatars.githubusercontent.com" }
    ],
    // Otimização de imagens da plataforma
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
  },

  // Headers de segurança globais (além do middleware)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

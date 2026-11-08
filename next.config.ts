import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolated browser verification can run alongside the normal development server.
  distDir: process.env.E2E_NEXT_DIST_DIR || '.next',
  experimental: {
    // The icon package re-exports ~4,700 modules from one barrel; rewriting its imports to the icons a file uses keeps the
    // first compile of every route from loading all of them. (lucide-react and radix-ui are already optimized by default.)
    optimizePackageImports: ['@hugeicons/core-free-icons', '@hugeicons/react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;

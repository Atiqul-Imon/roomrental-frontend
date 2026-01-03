import type { NextConfig } from 'next';

// Bundle analyzer (only enabled when ANALYZE=true)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    // ImageKit handles all image optimization and transformations
    // Keeping unoptimized: true is intentional - ImageKit provides:
    // - On-the-fly resizing and cropping
    // - Format conversion (WebP/AVIF)
    // - Quality optimization
    // - CDN delivery
    // Next.js image optimization would be redundant
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    // Turbopack handles optimization automatically
    // Package imports optimization is now built-in
  },
  // Bundle optimization (for webpack fallback if needed)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
            },
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
  // Experimental features (some moved to stable in Next.js 16)
  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-query', 'recharts'],
    optimizeCss: true,
  },
};

export default withBundleAnalyzer(nextConfig);


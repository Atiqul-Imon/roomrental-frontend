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
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            // React and React DOM - separate chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Next.js framework
            nextjs: {
              test: /[\\/]node_modules[\\/](next)[\\/]/,
              name: 'nextjs',
              priority: 25,
              reuseExistingChunk: true,
            },
            // TanStack Query - separate chunk
            reactQuery: {
              test: /[\\/]node_modules[\\/](@tanstack[\\/]react-query)[\\/]/,
              name: 'react-query',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Chart libraries
            charts: {
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
              name: 'charts',
              priority: 15,
              reuseExistingChunk: true,
            },
            // Socket.io - separate chunk (only loaded when needed)
            socket: {
              test: /[\\/]node_modules[\\/](socket\.io-client)[\\/]/,
              name: 'socket',
              priority: 15,
              reuseExistingChunk: true,
            },
            // Other vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Common chunks
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


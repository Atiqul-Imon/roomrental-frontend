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
          // CRITICAL FIX: Reduced from 25 to 10 to prevent chunk loading timeouts
          // Too many initial requests cause network congestion and timeouts
          maxInitialRequests: 10,
          // Increased minSize to reduce number of small chunks
          minSize: 50000, // 50KB minimum (increased from 20KB)
          maxSize: 244000, // 244KB maximum to prevent huge chunks
          cacheGroups: {
            // React and React DOM - separate chunk (critical, always needed)
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react',
              priority: 40,
              reuseExistingChunk: true,
              enforce: true, // Force this chunk to be created
            },
            // Next.js framework
            nextjs: {
              test: /[\\/]node_modules[\\/](next)[\\/]/,
              name: 'nextjs',
              priority: 35,
              reuseExistingChunk: true,
              enforce: true,
            },
            // TanStack Query - separate chunk (used on most pages)
            reactQuery: {
              test: /[\\/]node_modules[\\/](@tanstack[\\/]react-query)[\\/]/,
              name: 'react-query',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Heavy libraries - separate chunks (lazy loaded, not in initial bundle)
            leaflet: {
              test: /[\\/]node_modules[\\/](leaflet|react-leaflet)[\\/]/,
              name: 'leaflet',
              priority: 20,
              reuseExistingChunk: true,
              // Don't include in initial chunks
            },
            // Chart libraries (only used in admin/dashboard)
            charts: {
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
              name: 'charts',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Socket.io - separate chunk (only loaded when needed)
            socket: {
              test: /[\\/]node_modules[\\/](socket\.io-client)[\\/]/,
              name: 'socket',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Form libraries (used frequently)
            forms: {
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform[\\/]resolvers|zod)[\\/]/,
              name: 'forms',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Other vendor libraries - larger chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
              minChunks: 2,
            },
            // Common chunks (shared code)
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
              minSize: 30000, // Only create if > 30KB
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


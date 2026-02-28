module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],
        
        // Other important metrics
        'max-potential-fid': ['warn', { maxNumericValue: 130 }],
        'uses-responsive-images': 'warn',
        'uses-optimized-images': 'warn',
        'modern-image-formats': 'warn',
        'uses-text-compression': 'warn',
        'uses-long-cache-ttl': 'warn',
        'font-display': 'warn',
        'unminified-css': 'warn',
        'unminified-javascript': 'warn',
        'unused-css-rules': 'off', // Can be noisy with Tailwind
        'uses-rel-preconnect': 'warn',
        'server-response-time': ['warn', { maxNumericValue: 600 }],
        
        // Accessibility
        'color-contrast': 'off', // We have a good accessibility score
        
        // Best Practices
        'errors-in-console': 'warn',
        'no-vulnerable-libraries': 'error',
        
        // Categories
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  
  // Modular imports for better tree shaking
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}'
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}'
    },
    '@wandersonalwes/iconsax-react': {
      transform: '@wandersonalwes/iconsax-react/{{member}}'
    }
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '**'
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Environment variables
  env: {
    NEXT_APP_VERSION: process.env.NEXT_APP_VERSION || 'v4.0.0',
    NEXT_APP_GOOGLE_MAPS_API_KEY: process.env.NEXT_APP_GOOGLE_MAPS_API_KEY,
    NEXT_APP_MAPBOX_ACCESS_TOKEN: process.env.NEXT_APP_MAPBOX_ACCESS_TOKEN,
    NEXT_APP_API_URL: process.env.NEXT_APP_API_URL,
    NEXT_APP_JWT_SECRET: process.env.NEXT_APP_JWT_SECRET,
    NEXT_APP_JWT_TIMEOUT: process.env.NEXT_APP_JWT_TIMEOUT || '86400'
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@mui/material', 
      '@mui/lab', 
      '@mui/icons-material',
      '@wandersonalwes/iconsax-react'
    ],
    optimizeCss: true,
  },
  
  // Turbopack configuration (replaces deprecated turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Split chunks for better caching
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'mui',
          chunks: 'all',
        },
        iconsax: {
          test: /[\\/]node_modules[\\/]@wandersonalwes[\\/]/,
          name: 'iconsax',
          chunks: 'all',
        },
      },
    };
    
    // Development optimizations
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    return config;
  },
  
  // Output configuration
  output: 'standalone',
  trailingSlash: false,
  poweredByHeader: false,
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);

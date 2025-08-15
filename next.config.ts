/** @type {import('next').NextConfig} */
const nextConfig = {
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}'
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '**'
      }
    ]
  },
  // Remove hardcoded environment variables - they should come from .env.local
  env: {
    NEXT_APP_VERSION: process.env.NEXT_APP_VERSION || 'v4.0.0',
    NEXT_APP_GOOGLE_MAPS_API_KEY: process.env.NEXT_APP_GOOGLE_MAPS_API_KEY,
    NEXT_APP_MAPBOX_ACCESS_TOKEN: process.env.NEXT_APP_MAPBOX_ACCESS_TOKEN,
    NEXT_APP_API_URL: process.env.NEXT_APP_API_URL,
    NEXT_APP_JWT_SECRET: process.env.NEXT_APP_JWT_SECRET,
    NEXT_APP_JWT_TIMEOUT: process.env.NEXT_APP_JWT_TIMEOUT || '86400'
  },
  // Add experimental features for better performance
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/lab', '@mui/icons-material']
  },
  // Add webpack configuration for better bundle optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Add output configuration for static export if needed
  output: 'standalone',
  // Add trailing slash for better routing
  trailingSlash: false,
  // Add powered by header removal
  poweredByHeader: false
};

module.exports = nextConfig;

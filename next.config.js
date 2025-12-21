const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
  
  // Image optimization
  images: {
    domains: ['lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: false, // Enable image optimization in production
  },
  
  // Compression
  compress: true,
  
  // Power optimization
  poweredByHeader: false,
  
  // Production optimizations
  swcMinify: true,
  
  // Output configuration
  output: 'standalone', // Optimize for production deployment
  
  // Experimental features
  experimental: {
    optimizeCss: true,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for security
}

module.exports = nextConfig


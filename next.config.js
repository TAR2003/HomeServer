/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable SWC minifier for older CPU compatibility (Core 2 Duo)
  swcMinify: false,
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // Use Terser instead of SWC for minification
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.minimize = true;
    }
    return config;
  },
};

module.exports = nextConfig;

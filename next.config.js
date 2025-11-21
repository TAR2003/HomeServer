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
    // Disable worker threads that may cause SIGILL on older CPUs
    workerThreads: false,
    cpus: 1,
  },
  // Use Terser instead of SWC for minification
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.minimize = true;
    }
    // Disable webpack's built-in optimizations that might use unsupported CPU instructions
    config.optimization = {
      ...config.optimization,
      moduleIds: 'named',
      splitChunks: false,
    };
    return config;
  },
};

module.exports = nextConfig;

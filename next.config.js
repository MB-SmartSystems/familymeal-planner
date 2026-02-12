/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  images: {
    domains: [
      'images.kochbar.de',
      'img.chefkoch-cdn.de',
      'www.marions-kochbuch.de',
      'via.placeholder.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.kochbar.de',
        pathname: '/kbrezept/**',
      },
      {
        protocol: 'https',
        hostname: 'img.chefkoch-cdn.de',
        pathname: '/rezepte/**',
      },
      {
        protocol: 'https',
        hostname: 'www.marions-kochbuch.de',
        pathname: '/index-bilder/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ['@/components', '@/lib']
  }
}

module.exports = nextConfig
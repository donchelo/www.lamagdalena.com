import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/jarupia', destination: '/jarupia/index.html' },
      { source: '/jarupia/', destination: '/jarupia/index.html' },
    ]
  },
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ['@react-pdf/renderer', '@ai4u/mc-sso'],
  outputFileTracingIncludes: {
    '**': ['./public/fonts/**', './public/assets/logos/**', './data/**'],
  },
}

export default nextConfig

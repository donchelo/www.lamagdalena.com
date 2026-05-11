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
  serverExternalPackages: ['@react-pdf/renderer'],
  outputFileTracingIncludes: {
    '**': ['./public/fonts/**', './public/assets/logos/**', './data/**'],
  },
}

export default nextConfig

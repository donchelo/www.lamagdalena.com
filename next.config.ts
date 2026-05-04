import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ['@react-pdf/renderer'],
  outputFileTracingIncludes: {
    '**': ['./public/fonts/**', './public/assets/logos/**'],
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    GOOGLE_APPS_SCRIPT_URL: process.env.GOOGLE_APPS_SCRIPT_URL || '',
  },
  // Configuraciones para mejorar timeouts y conexiones
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Aumentar timeout para APIs
  httpAgentOptions: {
    keepAlive: true,
    timeout: 180000, // 3 minutos
  },
}

module.exports = nextConfig

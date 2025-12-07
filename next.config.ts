import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  experimental: {
    typedEnv: true,
    browserDebugInfoInTerminal: true,
  },
  images: {
    qualities: [70, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      // {
      //   protocol: 'https',
      //   hostname: '**',
      // },
    ],
  },
}

export default nextConfig

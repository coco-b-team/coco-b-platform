import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '146-181-43-63.nip.io',
      },
    ],
  },
};

export default nextConfig;

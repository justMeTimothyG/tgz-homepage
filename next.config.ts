import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg", "postgres"],
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fsn1.your-objectstorage.com',
        pathname: '/tluedtke/**',
      },
    ],
  },
};

export default nextConfig;

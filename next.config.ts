import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg", "postgres"],
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

export default nextConfig;

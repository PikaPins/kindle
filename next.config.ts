import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/kindle',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  turbopack: {},
};

export default nextConfig;

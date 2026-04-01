import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  // Allow images from external sources if needed
  images: {
    remotePatterns: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
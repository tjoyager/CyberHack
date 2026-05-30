import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ["localhost:3001", "127.0.0.1:3001"],
  },
};

export default nextConfig;

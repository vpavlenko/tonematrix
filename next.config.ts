import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly set the Turbopack root to this project to avoid workspace root mis-detection
    root: __dirname,
  },
};

export default nextConfig;

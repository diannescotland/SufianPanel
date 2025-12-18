import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable standalone output for optimized Docker builds
  output: 'standalone',

  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  reactStrictMode: true, // Enable strict mode for better error detection
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@tanstack/react-query'],
  },
};

export default nextConfig;

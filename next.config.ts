import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  transpilePackages: ["three", "@react-three/drei"],
};

export default nextConfig;

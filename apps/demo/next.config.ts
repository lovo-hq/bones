import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["bones"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/**",
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "tong.visitkorea.or.kr" },
      { hostname: "api.visitkorea.or.kr" },
    ],
  },
};

export default nextConfig;

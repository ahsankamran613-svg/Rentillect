import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled: React Strict Mode double-invokes effects in dev, doubling all network calls.
  // It has zero effect on production builds.
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.S3_HOSTNAME ?? "",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        process.env.NEXTAUTH_URL?.replace("https://", "") ?? "localhost:3000",
      ],
    },
  },
}

export default nextConfig

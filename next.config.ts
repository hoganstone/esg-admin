import type { NextConfig } from "next";

const FRONTEND_ORIGIN = process.env.FRONTEND_URL ?? 'https://esg-frontend-pied.vercel.app';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin',  value: FRONTEND_ORIGIN },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
          { key: 'Access-Control-Max-Age',       value: '86400' },
        ],
      },
    ];
  },
};

export default nextConfig;

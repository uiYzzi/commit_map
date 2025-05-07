import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // 允许任何网站嵌入此页面
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *", // 允许任何网站作为父框架
          },
        ],
      },
    ];
  },
};

export default nextConfig;

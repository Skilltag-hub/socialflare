/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost","ik.imagekit.io"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
};

module.exports = nextConfig;

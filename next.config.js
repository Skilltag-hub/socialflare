/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost","ik.imagekit.io","lh3.googleusercontent.com"],
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

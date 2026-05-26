/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',   // static export for Vercel — works perfectly with file-based content
};

module.exports = nextConfig;

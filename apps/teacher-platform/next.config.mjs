/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use Pages Router only - ignore app/ directory
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Explicitly set pages directory
  // Next.js will automatically use src/pages if it exists
  // and ignore app/ if pages exists
};

export default nextConfig;

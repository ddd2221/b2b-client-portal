/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    // If backend is accessed via internal docker name or proxy
    const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://backend:8000';
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

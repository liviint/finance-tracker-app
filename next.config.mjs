import withPWAInit from 'next-pwa';
const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

const nextConfig = withPWA({
  reactStrictMode: true,
  images: {
    domains: [
      'dev.api.liviint.com',
      'liviint.sgp1.digitaloceanspaces.com',
      'sgp1.digitaloceanspaces.com',
      'api.liviint.com',
      'upload.wikimedia.org',
      'media.istockphoto.com',
      'images.unsplash.com',
      'images.pexels.com',
      'kevinm002.pythonanywhere.com',
      'kevinm001.pythonanywhere.com',
      'liviints.sgp1.digitaloceanspaces.com',
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
});

export default nextConfig;

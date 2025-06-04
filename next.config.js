/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.js');

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 't9cc3bltg4ip0bqv.public.blob.vercel-storage.com',
        port: '',
        search: '',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default config;

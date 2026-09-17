/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turned off so the assistant's speech/effect sequences don't fire twice in dev.
  reactStrictMode: false,
  webpack: (config) => {
    // face-api.js (via @tensorflow/tfjs-core) pulls in Node-only code paths
    // (fs, node-fetch's optional 'encoding') that are never used in the
    // browser bundle this app actually ships — stub them out.
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, encoding: false };
    return config;
  },
};

export default nextConfig;

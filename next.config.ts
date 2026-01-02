import type { NextConfig } from "next";
import path from "node:path";

const LOADER = path.resolve(__dirname, 'src/visual-edits/component-tagger-loader.js');

    const nextConfig: NextConfig = {
      images: {
      remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
        {
          protocol: 'http',
          hostname: '**',
        },
      ],
    },
    turbopack: {},
  webpack: (config, { isServer }) => {
    // Exclude ioredis from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
      
      config.externals = config.externals || [];
      config.externals.push({
        ioredis: 'commonjs ioredis',
      });
    }
    
    // Exclude problematic directories with file extensions from being processed
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.(md|sql)$/,
      type: 'asset/resource',
      generator: {
        emit: false,
      },
    });
    
    return config;
  },
  // Exclude documentation and script directories from API routes
  // Exclude specific paths from being built as pages
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext => !['md', 'sql'].includes(ext)),
};

export default nextConfig;
// Orchids restart: 1760967635248
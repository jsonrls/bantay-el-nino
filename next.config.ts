import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/_next/static/chunks/maplibre-gl-worker.mjs",
        destination: "/maplibre-gl-worker.mjs",
      },
      {
        source: "/_next/static/chunks/maplibre-gl-worker-dev.mjs",
        destination: "/maplibre-gl-worker-dev.mjs",
      },
      {
        source: "/_next/static/chunks/maplibre-gl-worker.js",
        destination: "/maplibre-gl-worker.js",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*(maplibre-gl-worker.*)",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=UTF-8",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

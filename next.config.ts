import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // WordPress permalinks end in a slash; keep them identical for SEO
  trailingSlash: true,
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: [480, 720, 960, 1440],
    imageSizes: [240],
  },
  experimental: {
    // Inline the (small) stylesheet so first paint does not wait on a CSS request
    inlineCss: true,
  },
};

export default nextConfig;

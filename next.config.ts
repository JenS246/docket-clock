import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === '1';

const nextConfig: NextConfig = isGitHubPages
  ? {
      output: 'export',
      basePath: '/docket-clock',
      assetPrefix: '/docket-clock/',
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;

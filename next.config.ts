import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Explicitly set workspace root to this directory (risk-engine-js)
  // Prevents Next.js from incorrectly detecting parent directory lockfiles
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
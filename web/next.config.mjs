import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

export default function config(phase) {
  const staticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';
  return {
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
    devIndicators: false,
    ...(staticExport ? {
      output: 'export',
      trailingSlash: true,
      basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
    } : {}),
  };
}

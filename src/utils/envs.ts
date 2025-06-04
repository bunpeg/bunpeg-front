import { env } from '@/env';

export function isLocalServer() {
  return env.VERCEL_ENV === undefined;
}

export function isDevelopmentServer() {
  return env.VERCEL_ENV === 'development';
}

export function isPreviewServer() {
  return env.VERCEL_ENV === 'preview';
}

export function isProductionServer() {
  return env.VERCEL_ENV === 'production';
}

import type { HttpMethod } from '../types.ts';

export function normalizeMethod(method: string): HttpMethod {
  const upper = method.toUpperCase();
  if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(upper)) return upper as HttpMethod;
  return 'GET';
}

export function normalizeMockPath(pathname: string): string {
  return normalizePath(pathname.replace(/^\/mock/, '') || '/');
}

export function normalizePath(pathname: string): string {
  const prefixed = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return prefixed.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

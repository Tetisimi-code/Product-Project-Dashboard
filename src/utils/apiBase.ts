import { projectId, publicAnonKey } from './supabase/info';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || `https://${projectId}.supabase.co/functions/v1/server`;

export const API_ANON_KEY = publicAnonKey;

export function buildApiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

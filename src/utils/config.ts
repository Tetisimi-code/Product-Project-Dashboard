/**
 * Configuration Management
 * 
 * This file centralizes all environment-specific configuration,
 * making it easy to migrate to different platforms (Vercel, Netlify, AWS, etc.)
 */

// Platform detection
export const getPlatform = (): 'supabase' | 'vercel' | 'netlify' | 'custom' => {
  // Check for platform-specific environment variables
  if (typeof window !== 'undefined') {
    // Client-side detection
    if (window.location.hostname.includes('supabase')) return 'supabase';
    if (window.location.hostname.includes('vercel')) return 'vercel';
    if (window.location.hostname.includes('netlify')) return 'netlify';
  }
  
  return 'custom';
};

// API Configuration
export const getApiConfig = () => {
  // Try to get from environment variables (for custom deployments)
  const customApiUrl = import.meta.env.VITE_API_URL;
  const customApiKey = import.meta.env.VITE_API_KEY;
  
  if (customApiUrl) {
    return {
      apiUrl: customApiUrl,
      apiKey: customApiKey || '',
      platform: 'custom' as const,
    };
  }
  
  // Default to Supabase configuration
  try {
    const { projectId, publicAnonKey } = require('./supabase/info');
    return {
      apiUrl: `https://${projectId}.supabase.co/functions/v1/server`,
      apiKey: publicAnonKey,
      platform: 'supabase' as const,
    };
  } catch (error) {
    console.error('Failed to load API configuration:', error);
    throw new Error(
      'API configuration not found. Please set VITE_API_URL environment variable or ensure Supabase is properly configured.'
    );
  }
};

// Feature flags
export const features = {
  // Enable/disable features based on platform or environment
  enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  maxRetries: parseInt(import.meta.env.VITE_MAX_RETRIES || '3', 10),
  requestTimeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '30000', 10),
};

// Retry configuration
export const retryConfig = {
  maxRetries: features.maxRetries,
  initialDelay: 1000, // ms
  maxDelay: 10000, // ms
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Environment helpers
export const isDevelopment = import.meta.env.MODE === 'development';
export const isProduction = import.meta.env.MODE === 'production';

// Storage configuration
export const storageConfig = {
  // Where to store persistent data
  useLocalStorage: true,
  useSessionStorage: false,
  storagePrefix: 'reactive-board-',
};

// Auth configuration
export const authConfig = {
  tokenKey: 'accessToken',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  refreshBeforeExpiry: 5 * 60 * 1000, // 5 minutes
};

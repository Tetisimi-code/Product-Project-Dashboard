/**
 * Enhanced API Client
 * 
 * Provides robust API communication with:
 * - Automatic retry logic
 * - Better error handling
 * - Request/response interceptors
 * - Timeout handling
 * - Platform abstraction
 */

import { getApiConfig, features, authConfig } from './config';
import { withRetry, parseError, networkMonitor } from './errorHandling';

const config = getApiConfig();

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode?: number;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  skipRetry?: boolean;
  skipAuth?: boolean;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const timeout = options.timeout || features.requestTimeout;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

/**
 * Main fetch function with auth and error handling
 */
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  // Check network status
  if (!networkMonitor.isOnline) {
    return { 
      error: 'No internet connection',
      statusCode: 0,
    };
  }

  const makeRequest = async (): Promise<ApiResponse<T>> => {
    try {
      const token = localStorage.getItem(authConfig.tokenKey);
      
      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${config.apiUrl}${endpoint}`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add authorization unless explicitly skipped
      if (!options.skipAuth) {
        headers['Authorization'] = token 
          ? `Bearer ${token}` 
          : `Bearer ${config.apiKey}`;
      }

      const response = await fetchWithTimeout(url, {
        ...options,
        headers,
      });

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = 'Request failed';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        // Handle auth errors specially
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem(authConfig.tokenKey);
          
          // Emit auth error event
          window.dispatchEvent(new CustomEvent('auth-error', { 
            detail: { message: errorMessage } 
          }));
        }

        console.error(`API Error (${endpoint}):`, {
          status: response.status,
          message: errorMessage,
        });

        return { 
          error: errorMessage,
          statusCode: response.status,
        };
      }

      // Parse response
      const data = await response.json();
      return { data, statusCode: response.status };

    } catch (error) {
      const appError = parseError(error, endpoint);
      console.error(`API Exception (${endpoint}):`, appError);
      
      return { 
        error: appError.userMessage,
        statusCode: appError.statusCode,
      };
    }
  };

  // Apply retry logic unless skipped
  if (options.skipRetry) {
    return makeRequest();
  }

  try {
    return await withRetry(makeRequest, {
      onRetry: (attempt, error) => {
        console.log(`Retrying ${endpoint} (attempt ${attempt})`, error);
      },
      shouldRetry: (error) => {
        // Don't retry auth errors
        if (typeof error === 'object' && error !== null) {
          const statusCode = (error as any).statusCode;
          if (statusCode === 401 || statusCode === 403) {
            return false;
          }
        }
        return true;
      },
    });
  } catch (error) {
    return makeRequest(); // Final attempt without retry
  }
}

// ============================================
// PROJECTS API
// ============================================

export async function getProjects() {
  return fetchWithAuth<{ projects: any[] }>('/projects');
}

export async function createProject(project: any) {
  return fetchWithAuth<{ project: any }>('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  });
}

export async function updateProject(id: string, project: any) {
  return fetchWithAuth<{ project: any }>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(project),
  });
}

export async function deleteProject(id: string) {
  return fetchWithAuth<{ success: boolean }>(`/projects/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// FEATURES API
// ============================================

export async function getFeatures() {
  return fetchWithAuth<{ features: any[] }>('/features');
}

export async function createFeature(feature: any) {
  return fetchWithAuth<{ feature: any }>('/features', {
    method: 'POST',
    body: JSON.stringify(feature),
  });
}

export async function updateFeature(id: string, feature: any) {
  return fetchWithAuth<{ feature: any }>(`/features/${id}`, {
    method: 'PUT',
    body: JSON.stringify(feature),
  });
}

export async function deleteFeature(id: string) {
  return fetchWithAuth<{ success: boolean }>(`/features/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// CATEGORIES API
// ============================================

export async function getCategories() {
  return fetchWithAuth<{ categoryOrder: string[] }>('/categories');
}

export async function updateCategories(categoryOrder: string[]) {
  return fetchWithAuth<{ categoryOrder: string[] }>('/categories', {
    method: 'PUT',
    body: JSON.stringify({ categoryOrder }),
  });
}

// ============================================
// AUDIT LOG API
// ============================================

export async function getAuditLog() {
  return fetchWithAuth<{ auditLog: any[] }>('/audit');
}

export async function createAuditEntry(entry: any) {
  return fetchWithAuth<{ entry: any }>('/audit', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

// ============================================
// INITIALIZATION API
// ============================================

export async function initializeData(data: any) {
  return fetchWithAuth<{ success: boolean; message: string }>('/initialize', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================
// ADMIN API
// ============================================

export async function checkAdminStatus() {
  return fetchWithAuth<{ isAdmin: boolean; userId: string; email: string }>('/admin/check');
}

export async function listUsers() {
  return fetchWithAuth<{ users: any[] }>('/admin/users');
}

export async function deleteUser(userId: string) {
  return fetchWithAuth<{ success: boolean; message: string }>(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function deleteAllUsers() {
  return fetchWithAuth<{ success: boolean; message: string; deletedCount: number }>('/admin/users', {
    method: 'DELETE',
  });
}

// ============================================
// TEAM MEMBERS API
// ============================================

export interface TeamMember {
  id: string;
  email: string;
  name: string;
}

export async function getTeamMembers() {
  return fetchWithAuth<{ teamMembers: TeamMember[] }>('/team-members');
}

// ============================================
// HEALTH CHECK
// ============================================

export async function healthCheck() {
  return fetchWithAuth<{ status: string }>('/health', {
    skipRetry: true,
    timeout: 5000,
  });
}

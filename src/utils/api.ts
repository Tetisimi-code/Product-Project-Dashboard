import { projectId, publicAnonKey } from './supabase/info';
import { supabase } from './supabase/client';

// Use VITE_API_URL if available, otherwise fall back to default
const API_URL = import.meta.env.VITE_API_URL || `https://${projectId}.supabase.co/functions/v1/server`;const REQUEST_TIMEOUT = 30000; // 30 seconds

// Log API configuration on startup
console.log('API Configuration:', {
  projectId,
  apiUrl: API_URL,
  hasAnonKey: !!publicAnonKey,
  usingCustomUrl: !!import.meta.env.VITE_API_URL
});

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Helper to get fresh access token
async function getFreshToken(): Promise<string> {
  // Try to get the current session which will auto-refresh if needed
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    console.log('No active session, using anon key');
    return publicAnonKey;
  }
  
  // Update localStorage with fresh token
  localStorage.setItem('accessToken', session.access_token);
  return session.access_token;
}

// Helper to check network connectivity
function checkNetworkConnection(): boolean {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true; // Assume online if can't detect
}

// Helper function to fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
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
      throw new Error('Request timeout - the server took too long to respond');
    }
    throw error;
  }
}

// Helper function to make authenticated requests
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Check network connection first
    if (!checkNetworkConnection()) {
      return { 
        error: 'No internet connection. Please check your network and try again.' 
      };
    }

    // Always get fresh token before making request
    const token = await getFreshToken();
    
    const url = `${API_URL}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetchWithTimeout(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      
      // Don't log "expected" errors that are handled gracefully in the UI
      const expectedErrors = ['Jira not configured', 'Confluence not configured'];
      if (!expectedErrors.includes(error.error)) {
        console.error(`API Error (${endpoint}):`, {
          status: response.status,
          statusText: response.statusText,
          error: error.error,
        });
      }

      // Handle specific error cases
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('auth-error', { 
          detail: { message: error.error || 'Authentication failed' } 
        }));
        return { error: 'Session expired. Please log in again.' };
      }

      if (response.status === 403) {
        return { error: 'Access denied. You do not have permission to perform this action.' };
      }

      if (response.status === 404) {
        return { error: 'Resource not found.' };
      }

      if (response.status >= 500) {
        return { error: 'Server error. Please try again later.' };
      }

      return { error: error.error || 'Request failed' };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error(`API Exception (${endpoint}):`, error);
    
    // Provide more specific error messages
    if (error instanceof TypeError) {
      if (error.message.includes('fetch')) {
        return { 
          error: 'Unable to connect to the server. Please check your internet connection and try again.' 
        };
      }
      if (error.message.includes('timeout')) {
        return { 
          error: 'Request timeout. The server took too long to respond. Please try again.' 
        };
      }
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'An unexpected error occurred. Please try again.' };
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
// DOCUMENTATION API
// ============================================

export async function generateUserManual(projectId: string, idempotencyKey?: string) {
  return fetchWithAuth<{ jobId: string }>('/docs/generate', {
    method: 'POST',
    body: JSON.stringify({ projectId, idempotencyKey }),
  });
}

export async function getDocumentationJob(jobId: string) {
  return fetchWithAuth<{ job: any }>(`/docs/jobs/${jobId}`);
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

// Promote user to admin
export async function makeUserAdmin(userId: string) {
  return fetchWithAuth<{ success: boolean; message: string }>(`/admin/users/${userId}/make-admin`, {
    method: 'POST',
  });
}

// Revoke admin from user
export async function removeUserAdmin(userId: string) {
  return fetchWithAuth<{ success: boolean; message: string }>(`/admin/users/${userId}/remove-admin`, {
    method: 'POST',
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
// ATLASSIAN INTEGRATION API
// ============================================

export async function getAtlassianConfig() {
  return fetchWithAuth<{ 
    jira?: { url: string; email: string; connected: boolean };
    confluence?: { url: string; email: string; connected: boolean };
  }>('/atlassian/config');
}

export async function saveJiraConfig(config: { url: string; email: string; token: string }) {
  return fetchWithAuth<{ success: boolean }>('/atlassian/jira/config', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function saveConfluenceConfig(config: { url: string; email: string; token: string }) {
  return fetchWithAuth<{ success: boolean }>('/atlassian/confluence/config', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function testJiraConnection() {
  return fetchWithAuth<{ success: boolean; siteName?: string }>('/atlassian/jira/test');
}

export async function testConfluenceConnection() {
  return fetchWithAuth<{ success: boolean; siteName?: string }>('/atlassian/confluence/test');
}

export async function disconnectJira() {
  return fetchWithAuth<{ success: boolean }>('/atlassian/jira/disconnect', {
    method: 'DELETE',
  });
}

export async function disconnectConfluence() {
  return fetchWithAuth<{ success: boolean }>('/atlassian/confluence/disconnect', {
    method: 'DELETE',
  });
}

export async function getJiraProjects() {
  return fetchWithAuth<{ projects: any[] }>('/atlassian/jira/projects');
}

export async function linkProjectToJira(projectId: string, jiraKey: string) {
  return fetchWithAuth<{ success: boolean; jiraUrl: string }>('/atlassian/jira/link', {
    method: 'POST',
    body: JSON.stringify({ projectId, jiraKey }),
  });
}

export async function createJiraIssue(data: {
  projectId: string;
  featureId: string;
  summary: string;
  description: string;
  issueType: string;
}) {
  return fetchWithAuth<{ success: boolean; issueKey: string; issueUrl: string }>('/atlassian/jira/create-issue', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getConfluenceSpaces() {
  return fetchWithAuth<{ spaces: any[] }>('/atlassian/confluence/spaces');
}

export async function linkProjectToConfluence(projectId: string, pageId: string, pageUrl: string) {
  return fetchWithAuth<{ success: boolean }>('/atlassian/confluence/link', {
    method: 'POST',
    body: JSON.stringify({ projectId, pageId, pageUrl }),
  });
}

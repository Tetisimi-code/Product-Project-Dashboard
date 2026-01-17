# Error Handling Guide

Your app now has comprehensive error handling to ensure reliability and a great user experience, even when things go wrong.

## 🎯 Overview

Error handling is implemented at multiple levels:

1. **React Error Boundary** - Catches component crashes
2. **API Client** - Handles network and server errors
3. **Network Monitor** - Detects offline/online status
4. **Validation Helpers** - Prevents bad data
5. **User Notifications** - Clear error messages via toast

---

## 🛡️ Components Added

### 1. ErrorBoundary Component

**Location**: `/components/ErrorBoundary.tsx`

**What it does**: Catches any React component errors and prevents the entire app from crashing.

**Usage**:
```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

// Wrap your app
function Main() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
```

**Features**:
- ✅ Shows user-friendly error page
- ✅ Displays error details in development
- ✅ "Reload Application" button
- ✅ Logs errors to console
- ✅ Can be extended to log to external services (Sentry, etc.)

---

### 2. Enhanced API Client

**Location**: `/utils/apiClient.ts`

**What it does**: Replaces the old `/utils/api.ts` with improved error handling and retry logic.

**To Use**:
```typescript
// Option 1: Replace existing api.ts
// Delete or rename /utils/api.ts
// Rename /utils/apiClient.ts to /utils/api.ts

// Option 2: Gradual migration
import * as oldApi from './utils/api';
import * as newApi from './utils/apiClient';
```

**Features**:
- ✅ Automatic retry on failure (3 attempts with exponential backoff)
- ✅ Request timeout (30s default)
- ✅ Network status check before requests
- ✅ Auth error handling (auto-logout on 401)
- ✅ User-friendly error messages
- ✅ Detailed error logging

**Example**:
```typescript
import { getProjects } from './utils/apiClient';

const result = await getProjects();

if (result.error) {
  // Error already logged and shown to user
  console.error('Failed to load projects:', result.error);
} else {
  // Success!
  setProjects(result.data.projects);
}
```

---

### 3. Error Handling Utilities

**Location**: `/utils/errorHandling.ts`

**Functions**:

#### `parseError(error, context?)`
Converts any error into a user-friendly AppError object.

```typescript
import { parseError } from './utils/errorHandling';

try {
  await riskyOperation();
} catch (error) {
  const appError = parseError(error, 'Loading projects');
  console.log(appError.userMessage); // User-friendly message
  console.log(appError.type); // 'network' | 'authentication' | etc.
  console.log(appError.retryable); // true/false
}
```

#### `showError(error, context?)`
Shows error toast notification automatically.

```typescript
import { showError } from './utils/errorHandling';

try {
  await riskyOperation();
} catch (error) {
  showError(error, 'Saving project');
  // Automatically shows toast with user-friendly message
}
```

#### `withRetry(fn, options?)`
Retries failed operations automatically.

```typescript
import { withRetry } from './utils/errorHandling';

const data = await withRetry(
  async () => {
    return await fetchData();
  },
  {
    maxRetries: 3,
    onRetry: (attempt) => {
      console.log(`Retry attempt ${attempt}`);
    },
  }
);
```

#### `networkMonitor`
Singleton that monitors online/offline status.

```typescript
import { networkMonitor } from './utils/errorHandling';

// Check current status
if (networkMonitor.isOnline) {
  await syncData();
}

// Subscribe to changes
const unsubscribe = networkMonitor.subscribe((online) => {
  if (online) {
    console.log('Back online!');
    syncPendingChanges();
  } else {
    console.log('Offline mode');
  }
});

// Cleanup when component unmounts
useEffect(() => {
  return unsubscribe;
}, []);
```

#### Validation Helpers

```typescript
import { validateEmail, validatePassword, validateRequired } from './utils/errorHandling';

try {
  validateRequired(name, 'Name');
  validateEmail(email);
  validatePassword(password);
  // All good!
} catch (error) {
  showError(error);
}
```

---

### 4. Configuration Management

**Location**: `/utils/config.ts`

**What it does**: Centralizes all configuration for easy platform migration.

**Key Exports**:

```typescript
import { getApiConfig, features, retryConfig } from './utils/config';

// Get API configuration
const config = getApiConfig();
console.log(config.apiUrl); // Current API URL
console.log(config.platform); // 'supabase' | 'vercel' | 'custom'

// Feature flags
if (features.enableOfflineMode) {
  // Enable offline features
}

// Retry settings
const maxRetries = features.maxRetries; // 3
const timeout = features.requestTimeout; // 30000ms
```

**Environment Variables**:
```bash
# .env
VITE_API_URL=https://your-api.com
VITE_API_KEY=your_key
VITE_MAX_RETRIES=3
VITE_REQUEST_TIMEOUT=30000
VITE_ENABLE_OFFLINE=true
```

---

## 🚀 How to Activate

### Step 1: Wrap App with ErrorBoundary

Find your app's entry point (usually `main.tsx` or `index.tsx` or where `<App />` is rendered):

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';

// Wrap the app
function Main() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default Main;
```

### Step 2: Switch to Enhanced API Client

**Option A: Replace (Recommended)**
```bash
# Backup old API
mv utils/api.ts utils/api.old.ts

# Use new API client
mv utils/apiClient.ts utils/api.ts
```

**Option B: Update imports gradually**
```typescript
// In each file
// Old:
// import * as api from './utils/api';

// New:
import * as api from './utils/apiClient';
```

### Step 3: Add Network Status Indicator (Optional)

In your main App component:

```typescript
import { networkMonitor } from './utils/errorHandling';
import { useState, useEffect } from 'react';

function App() {
  const [isOnline, setIsOnline] = useState(networkMonitor.isOnline);

  useEffect(() => {
    return networkMonitor.subscribe(setIsOnline);
  }, []);

  return (
    <>
      {!isOnline && (
        <div className="bg-yellow-500 text-white p-2 text-center">
          You are offline. Some features may not work.
        </div>
      )}
      {/* Rest of your app */}
    </>
  );
}
```

---

## 📊 Error Types and Messages

### Network Errors
- **Trigger**: No internet, timeout, DNS failure
- **User Message**: "Unable to connect to the server. Please check your internet connection."
- **Retryable**: Yes
- **Retry Count**: 3 attempts

### Authentication Errors (401)
- **Trigger**: Invalid or expired token
- **User Message**: "Your session has expired. Please log in again."
- **Retryable**: No
- **Action**: Auto-logout and redirect to login

### Authorization Errors (403)
- **Trigger**: Insufficient permissions
- **User Message**: "You do not have permission to perform this action."
- **Retryable**: No

### Server Errors (500+)
- **Trigger**: Backend error
- **User Message**: "The server encountered an error. Please try again later."
- **Retryable**: Yes
- **Retry Count**: 3 attempts

### Rate Limiting (429)
- **Trigger**: Too many requests
- **User Message**: "Too many requests. Please wait a moment and try again."
- **Retryable**: Yes
- **Delay**: Exponential backoff (1s, 2s, 4s)

### Validation Errors
- **Trigger**: Invalid user input
- **User Message**: Specific validation message (e.g., "Password must be at least 8 characters")
- **Retryable**: No

---

## 🧪 Testing Error Handling

### Test 1: Network Offline

```bash
1. Disconnect internet
2. Try to load projects
3. Should see: "No internet connection" toast
4. Reconnect internet
5. Should see: "Back online" toast
```

### Test 2: API Timeout

```bash
# In browser console
// Slow down network in DevTools
// Network tab > Throttling > Slow 3G

# Try API operations
# Should see retry attempts and eventual timeout
```

### Test 3: Component Error

```typescript
// Add to any component temporarily
throw new Error('Test error boundary');

// Should see:
// - Error boundary page
// - "Reload Application" button
// - Error details in development mode
```

### Test 4: Invalid Token

```bash
# In browser console
localStorage.setItem('accessToken', 'invalid-token');

# Try any API operation
# Should see:
// - "Your session has expired" message
// - Auto-logout
// - Redirect to login
```

### Test 5: Retry Logic

```typescript
// In browser console - simulate flaky API
let callCount = 0;
const originalFetch = window.fetch;
window.fetch = (...args) => {
  if (callCount++ < 2 && args[0].includes('/projects')) {
    console.log('Simulating network error');
    return Promise.reject(new Error('Network error'));
  }
  return originalFetch(...args);
};

// Try loading projects
// Should see 2 failures, then success
```

---

## 🔧 Customization

### Custom Error Messages

Edit `/utils/errorHandling.ts`:

```typescript
export function parseError(error: unknown, context?: string): AppError {
  // Add your custom logic
  if (error.message === 'CUSTOM_ERROR') {
    return {
      type: 'validation',
      message: 'Internal error code',
      userMessage: 'Your custom user-facing message',
      retryable: false,
    };
  }
  
  // ... rest of default logic
}
```

### Custom Retry Configuration

Edit `/utils/config.ts`:

```typescript
export const retryConfig = {
  maxRetries: 5, // Change from 3 to 5
  initialDelay: 500, // Start with 500ms
  maxDelay: 20000, // Max 20 seconds
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};
```

### External Error Logging

Edit `/components/ErrorBoundary.tsx`:

```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  console.error('ErrorBoundary caught an error:', error, errorInfo);
  
  // Send to Sentry
  Sentry.captureException(error, { extra: errorInfo });
  
  // Or LogRocket
  LogRocket.captureException(error);
  
  // Or custom service
  fetch('https://your-logging-service.com/errors', {
    method: 'POST',
    body: JSON.stringify({ error: error.message, stack: error.stack }),
  });
}
```

---

## 📋 Checklist

- [ ] Wrap `<App />` with `<ErrorBoundary>`
- [ ] Replace `/utils/api.ts` with `/utils/apiClient.ts`
- [ ] Test network offline scenario
- [ ] Test API errors
- [ ] Test component errors
- [ ] Add network status indicator (optional)
- [ ] Set up error reporting service (optional)
- [ ] Review error messages for clarity
- [ ] Test on staging before production

---

## 🆘 Common Issues

### "Module not found: config"

**Solution**: Make sure you created `/utils/config.ts`

### "Cannot read property 'projectId' of undefined"

**Solution**: The new API client tries to fall back to Supabase config. Set `VITE_API_URL` in `.env` or ensure `/utils/supabase/info.tsx` exists.

### Errors not showing toast notifications

**Solution**: Make sure the `<Toaster />` component is rendered in your app (usually already in `App.tsx`).

### Retry logic not working

**Solution**: Check that you're using `/utils/apiClient.ts` not the old `/utils/api.ts`

---

## 📚 Additional Resources

- [Platform Migration Guide](./PLATFORM_MIGRATION_GUIDE.md)
- [Configuration Options](./utils/config.ts)
- [Error Types Reference](./utils/errorHandling.ts)
- [API Client Documentation](./utils/apiClient.ts)

---

## Summary

Your app now has **enterprise-grade error handling**:

✅ **Error Boundary** prevents full crashes  
✅ **Automatic Retries** handle transient failures  
✅ **Network Detection** manages offline scenarios  
✅ **User-Friendly Messages** improve UX  
✅ **Detailed Logging** helps debugging  
✅ **Platform Independent** easy to migrate  

You're ready to deploy with confidence! 🚀

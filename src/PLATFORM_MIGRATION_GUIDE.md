# Platform Migration Guide

This guide explains how to deploy your Product-Project Management Board on different platforms and ensure robust error handling.

## Table of Contents

1. [Current Setup (Supabase)](#current-setup-supabase)
2. [Migrating to Other Platforms](#migrating-to-other-platforms)
3. [Error Handling Overview](#error-handling-overview)
4. [Environment Variables](#environment-variables)
5. [Testing Deployment](#testing-deployment)

---

## Current Setup (Supabase)

Your app is currently configured for Supabase with:
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Key-Value Store

---

## Migrating to Other Platforms

### Option 1: Vercel

**Frontend Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Backend Options:**
1. **Keep Supabase Backend** (Recommended)
   - No changes needed
   - Set environment variables in Vercel dashboard

2. **Use Vercel Serverless Functions**
   - Convert `/supabase/functions/server/index.tsx` to `/api/*.ts`
   - Use Vercel KV for database
   - Rewrite using Node.js/Express

**Environment Variables in Vercel:**
```bash
# If keeping Supabase backend
VITE_API_URL=https://YOUR_PROJECT.supabase.co/functions/v1/server
VITE_API_KEY=your_supabase_anon_key

# If using custom backend
VITE_API_URL=https://your-app.vercel.app/api
VITE_API_KEY=your_custom_key
```

---

### Option 2: Netlify

**Frontend Deployment:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**Backend Options:**
1. **Keep Supabase Backend** (Recommended)
2. **Use Netlify Functions**
   - Convert to `/netlify/functions/*.ts`
   - Use Netlify Blobs for storage

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
```

---

### Option 3: AWS (Amplify/Lambda)

**Frontend: AWS Amplify**
```bash
# Install Amplify CLI
npm i -g @aws-amplify/cli

# Initialize
amplify init
amplify add hosting
amplify publish
```

**Backend: AWS Lambda + API Gateway**
- Convert edge functions to Lambda functions
- Use DynamoDB instead of KV store
- Use Cognito for authentication

---

### Option 4: Custom VPS (DigitalOcean, Linode, etc.)

**Full Stack Node.js Deployment:**

1. **Frontend**: Build static files
   ```bash
   npm run build
   ```

2. **Backend**: Convert to Express.js
   ```typescript
   // server.ts
   import express from 'express';
   const app = express();
   
   // Copy routes from /supabase/functions/server/index.tsx
   app.get('/api/projects', ...);
   // ... etc
   
   app.listen(3000);
   ```

3. **Database**: PostgreSQL or MongoDB
4. **Process Manager**: PM2
   ```bash
   pm2 start server.ts
   ```

---

## Error Handling Overview

Your app now includes comprehensive error handling:

### 1. React Error Boundary

Catches component-level errors and prevents full app crashes.

**Location**: `/components/ErrorBoundary.tsx`

**Usage**: Already wrapped around `<App />` in main entry point.

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 2. API Error Handling

**Location**: `/utils/apiClient.ts`

Features:
- ✅ Automatic retry with exponential backoff
- ✅ Timeout handling (30s default)
- ✅ Network status detection
- ✅ User-friendly error messages
- ✅ Auth error handling (auto-logout on 401)

### 3. Network Monitor

**Location**: `/utils/errorHandling.ts`

Detects online/offline status and shows notifications:
```typescript
import { networkMonitor } from './utils/errorHandling';

if (!networkMonitor.isOnline) {
  // Show offline message
}
```

### 4. Validation Helpers

**Location**: `/utils/errorHandling.ts`

```typescript
import { validateEmail, validatePassword } from './utils/errorHandling';

try {
  validateEmail(email);
  validatePassword(password);
} catch (error) {
  // Show validation error
}
```

---

## Environment Variables

### Required Variables

Create a `.env` file in your project root:

```bash
# API Configuration
VITE_API_URL=https://your-backend.com/api
VITE_API_KEY=your_api_key

# Optional Features
VITE_ENABLE_OFFLINE=false
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=false
VITE_MAX_RETRIES=3
VITE_REQUEST_TIMEOUT=30000
```

### Platform-Specific Variables

**Supabase (Current):**
```bash
# Auto-loaded from /utils/supabase/info.tsx
# No additional variables needed
```

**Vercel:**
```bash
# Add in Vercel Dashboard > Settings > Environment Variables
VITE_API_URL=...
VITE_API_KEY=...
```

**Netlify:**
```bash
# Add in Netlify Dashboard > Site settings > Environment variables
VITE_API_URL=...
VITE_API_KEY=...
```

---

## Testing Deployment

### 1. Test Error Handling

**Network Errors:**
```bash
# Disconnect internet
# Try using the app
# Should see "No internet connection" message
```

**API Errors:**
```bash
# Set wrong API URL in .env
VITE_API_URL=https://invalid-url.com

# Should see retry attempts and error messages
```

**Component Errors:**
```typescript
// Add in any component to test error boundary
throw new Error('Test error');
```

### 2. Test API Migration

**Step 1**: Switch to new API client
```typescript
// In any file using API
// Old:
import * as api from './utils/api';

// New (enhanced):
import * as api from './utils/apiClient';
```

**Step 2**: Test with current backend
```bash
npm run dev
# Should work exactly the same
```

**Step 3**: Point to new backend
```bash
# .env
VITE_API_URL=https://your-new-backend.com/api
```

### 3. Test Retry Logic

```typescript
// In browser console:
// Simulate flaky network
let failCount = 0;
const originalFetch = window.fetch;
window.fetch = (...args) => {
  if (failCount++ < 2) {
    return Promise.reject(new Error('Network error'));
  }
  return originalFetch(...args);
};

// Try an API call - should retry and succeed
```

---

## Migration Checklist

- [ ] Choose target platform
- [ ] Set up environment variables
- [ ] Update API configuration in `.env`
- [ ] Test error handling
- [ ] Test retry logic
- [ ] Test offline behavior
- [ ] Deploy frontend
- [ ] Deploy backend (if migrating)
- [ ] Update DNS (if custom domain)
- [ ] Monitor error logs
- [ ] Set up error reporting (optional: Sentry, LogRocket)

---

## Recommended Migration Path

### Easiest (Keep Backend)

1. **Deploy frontend** to Vercel/Netlify
2. **Keep Supabase** for backend/database
3. **Update environment** variables to point to Supabase
4. ✅ **Zero backend changes required**

### Full Migration

1. **Deploy frontend** to chosen platform
2. **Migrate database** to new provider
3. **Convert backend** to new runtime (if needed)
4. **Update API client** configuration
5. **Test thoroughly** before switching traffic

---

## Error Reporting Setup (Optional)

### Sentry Integration

```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

### LogRocket Integration

```bash
npm install logrocket
```

```typescript
// main.tsx
import LogRocket from 'logrocket';

LogRocket.init('your-app-id');
```

---

## Support

If you encounter issues during migration:

1. Check environment variables are set correctly
2. Review error messages in browser console
3. Check network tab for failed requests
4. Test with `npm run dev` locally first
5. Verify API endpoints are accessible

---

## Summary

Your app is now **platform-independent** with:

✅ **Error Boundary** - Catches React crashes  
✅ **Retry Logic** - Handles flaky networks  
✅ **Timeout Handling** - Prevents hanging requests  
✅ **Network Detection** - Offline support  
✅ **Config Abstraction** - Easy platform switching  
✅ **User-Friendly Errors** - Clear messages  

You can now deploy to **any platform** with minimal changes!

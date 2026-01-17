# Error Handling Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Error Boundary                        │   │
│  │  • Catches component crashes                             │   │
│  │  • Shows friendly error page                             │   │
│  │  • Prevents full app crash                               │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                           │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │              Application Components                      │   │
│  │  • ProjectBoard                                          │   │
│  │  • TimelineView                                          │   │
│  │  • FeaturesMatrix                                        │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                           │
└───────────────────────┼───────────────────────────────────────────┘
                        │
                        │ API Calls
                        │
┌───────────────────────▼───────────────────────────────────────────┐
│                     API CLIENT LAYER                              │
│                   (/utils/apiClient.ts)                           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. Check Network Status                                 │    │
│  │    ↓                                                     │    │
│  │ 2. Add Authentication Header                            │    │
│  │    ↓                                                     │    │
│  │ 3. Set Timeout (30s)                                    │    │
│  │    ↓                                                     │    │
│  │ 4. Make Request                                         │    │
│  │    ↓                                                     │    │
│  │ 5. Handle Response                                      │    │
│  │    • Success → Return data                              │    │
│  │    • 401 → Logout & redirect                            │    │
│  │    • 500 → Retry logic                                  │    │
│  │    • Timeout → Retry logic                              │    │
│  │    • Network error → Retry logic                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└───────────────────────┬───────────────────────────────────────────┘
                        │
                        │ Retry Logic (if needed)
                        │
┌───────────────────────▼───────────────────────────────────────────┐
│                    RETRY MECHANISM                                │
│                 (/utils/errorHandling.ts)                         │
│                                                                   │
│  Attempt 1: Immediate                                            │
│      ↓ Failed                                                    │
│  Wait 1 second                                                   │
│      ↓                                                           │
│  Attempt 2: After 1s delay                                       │
│      ↓ Failed                                                    │
│  Wait 2 seconds                                                  │
│      ↓                                                           │
│  Attempt 3: After 2s delay                                       │
│      ↓ Failed                                                    │
│  Wait 4 seconds                                                  │
│      ↓                                                           │
│  Final Attempt: After 4s delay                                   │
│      ↓                                                           │
│  If still failed → Show error to user                            │
│                                                                   │
└───────────────────────┬───────────────────────────────────────────┘
                        │
                        │
┌───────────────────────▼───────────────────────────────────────────┐
│                  ERROR NOTIFICATION                               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Toast Notification (Sonner)                            │    │
│  │  • User-friendly message                                │    │
│  │  • Action button (if retryable)                         │    │
│  │  • Auto-dismiss (4-5 seconds)                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└────────────────────────────────────────────────────────────────────┘
```

---

## Error Flow by Type

### 1. Network Error Flow

```
User Action (e.g., Load Projects)
    ↓
Check if online (networkMonitor)
    ↓
├─ Offline → Show "No internet" toast
│                  ↓
│                  Stop (don't make request)
│
└─ Online → Make API request
              ↓
         Network fails (e.g., DNS error)
              ↓
         Catch error in apiClient
              ↓
         Classify as network error
              ↓
         Start retry logic
              ↓
         Wait 1s → Retry
              ↓
         Still fails → Wait 2s → Retry
              ↓
         Still fails → Wait 4s → Retry
              ↓
         Still fails → Show error toast
              ↓
         Log error to console
              ↓
         Return error to component
```

### 2. Authentication Error Flow (401)

```
User Action (e.g., Update Project)
    ↓
Make API request with auth token
    ↓
Server returns 401 Unauthorized
    ↓
API client detects 401 status
    ↓
Clear invalid token from localStorage
    ↓
Dispatch 'auth-error' event
    ↓
App listens to event → Logout user
    ↓
Show "Session expired" toast
    ↓
Redirect to login page
    ↓
User logs in again
```

### 3. Component Error Flow

```
Component renders
    ↓
Error thrown in component code
    ↓
Error Boundary catches error
    ↓
Log error to console
    ↓
(Optional) Send to error tracking service
    ↓
Show error boundary UI
    ↓
User clicks "Reload Application"
    ↓
window.location.reload()
    ↓
App restarts fresh
```

### 4. Server Error Flow (500)

```
User Action
    ↓
Make API request
    ↓
Server returns 500 error
    ↓
API client detects 500 status
    ↓
Classify as server error (retryable)
    ↓
Retry #1 after 1s
    ↓
Retry #2 after 2s
    ↓
Retry #3 after 4s
    ↓
All retries exhausted
    ↓
Show "Server error" toast
    ↓
Log error details
    ↓
Return error to component
```

---

## Component Hierarchy

```
<ErrorBoundary>                    ← Catches all component errors
    │
    └─ <App>                       ← Main application
        │
        ├─ <NetworkMonitor>        ← Watches online/offline
        │
        ├─ <ProductProjectBoard>   ← Uses API client
        │   │
        │   ├─ <ProjectCard>       ← Uses API client
        │   └─ <FeatureCard>       ← Uses API client
        │
        ├─ <TimelineView>          ← Uses API client
        │
        └─ <FeaturesMatrix>        ← Uses API client
```

---

## Data Flow

### Successful Request

```
Component
    │
    │ api.getProjects()
    ↓
apiClient
    │
    │ Check network
    │ Add auth header
    │ Set timeout
    │ Make fetch request
    ↓
Network
    │
    │ Request to server
    ↓
Server
    │
    │ Process request
    │ Return 200 + data
    ↓
apiClient
    │
    │ Parse JSON
    │ Return { data: projects }
    ↓
Component
    │
    │ setProjects(data.projects)
    │ Update UI
    ↓
User sees updated UI ✅
```

### Failed Request (with retry)

```
Component
    │
    │ api.getProjects()
    ↓
apiClient
    │
    │ Check network ✅
    │ Make request
    ↓
Network
    │
    │ Timeout / Error ❌
    ↓
apiClient
    │
    │ Catch error
    │ withRetry() called
    ↓
Retry Logic
    │
    │ Attempt 1: Wait 1s
    │    ↓ Failed
    │ Attempt 2: Wait 2s
    │    ↓ Failed
    │ Attempt 3: Wait 4s
    │    ↓ Failed
    ↓
errorHandling
    │
    │ parseError()
    │ showError()
    ↓
Toast Notification
    │
    │ "Unable to connect to server"
    │ "Please check your internet"
    ↓
Component
    │
    │ Handle error case
    │ Show error state in UI
    ↓
User sees error message ⚠️
```

---

## Configuration Layers

```
┌─────────────────────────────────────────────────────┐
│ Environment Variables (.env)                        │
│ • VITE_API_URL                                      │
│ • VITE_API_KEY                                      │
│ • VITE_MAX_RETRIES                                  │
│ • VITE_REQUEST_TIMEOUT                              │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ Configuration Layer (/utils/config.ts)              │
│ • Reads environment variables                       │
│ • Sets defaults                                     │
│ • Exports typed config objects                      │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ API Client (/utils/apiClient.ts)                    │
│ • Uses config for API URL                           │
│ • Uses config for retry settings                    │
│ • Uses config for timeout                           │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ Application Components                              │
│ • Make API calls                                    │
│ • Handle responses                                  │
└─────────────────────────────────────────────────────┘
```

---

## Platform Independence Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    Application Code                           │
│  • React components                                           │
│  • Business logic                                             │
│  • UI state management                                        │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         │ Uses abstracted API
                         │
┌────────────────────────▼──────────────────────────────────────┐
│              API Client (/utils/apiClient.ts)                 │
│  • Platform-independent interface                             │
│  • Uses getApiConfig() for endpoints                          │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         │ Gets config from
                         │
┌────────────────────────▼──────────────────────────────────────┐
│           Configuration (/utils/config.ts)                    │
│  • Checks for VITE_API_URL env var                            │
│  • Falls back to Supabase if not set                          │
│  • Returns { apiUrl, apiKey, platform }                       │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         │ Routes to
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ↓                               ↓
┌─────────────────┐           ┌─────────────────────┐
│ Supabase        │           │ Any Other Platform  │
│ • Edge Functions│           │ • Vercel Functions  │
│ • Auth          │           │ • Netlify Functions │
│ • PostgreSQL    │           │ • AWS Lambda        │
│ • KV Store      │           │ • Custom API        │
└─────────────────┘           └─────────────────────┘
```

---

## Error State Management

```
┌────────────────────────────────────────────────────┐
│ Component State                                    │
│                                                    │
│ • isLoading: boolean                               │
│ • error: string | null                             │
│ • data: T | null                                   │
│                                                    │
│ States:                                            │
│ 1. Initial:    { loading: false, error: null }    │
│ 2. Loading:    { loading: true,  error: null }    │
│ 3. Success:    { loading: false, data: [...] }    │
│ 4. Error:      { loading: false, error: "..." }   │
│ 5. Retry:      { loading: true,  error: "..." }   │
└────────────────────────────────────────────────────┘

Example Usage:

function ProjectsList() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  async function loadProjects() {
    setIsLoading(true);
    setError(null);
    
    const result = await api.getProjects();
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    
    setProjects(result.data.projects);
    setIsLoading(false);
  }

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} onRetry={loadProjects} />;
  return <ProjectsGrid projects={projects} />;
}
```

---

## Monitoring & Logging

```
┌─────────────────────────────────────────────────────┐
│ Application Events                                  │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────┴─────────┬──────────┬──────────┐
        │                  │          │          │
        ↓                  ↓          ↓          ↓
┌────────────┐   ┌──────────────┐   │   ┌─────────────┐
│ Console    │   │ Toast        │   │   │ Error       │
│ Logs       │   │ Notifications│   │   │ Boundary    │
│            │   │              │   │   │ UI          │
│ • Errors   │   │ • User msgs  │   │   │             │
│ • Retries  │   │ • Actions    │   │   │ • Stack     │
│ • Timing   │   │              │   │   │   trace     │
└────────────┘   └──────────────┘   │   └─────────────┘
                                    │
                         (Optional) │
                                    │
                        ┌───────────▼──────────┐
                        │ External Services    │
                        │ • Sentry             │
                        │ • LogRocket          │
                        │ • Custom logging API │
                        └──────────────────────┘
```

---

## Summary

This architecture provides:

✅ **Defense in Depth**: Multiple layers of error handling  
✅ **User Experience**: Clear messages and retry logic  
✅ **Developer Experience**: Detailed logging and debugging  
✅ **Platform Independence**: Easy to migrate  
✅ **Production Ready**: Enterprise-grade reliability  

Each layer has a specific responsibility and can be tested independently.

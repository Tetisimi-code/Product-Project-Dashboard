# 🏗️ Application Architecture Guide

> **Complete guide to understanding the application's structure, data flow, and component hierarchy**

---

## 📋 Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Component Hierarchy](#component-hierarchy)
3. [Data Flow](#data-flow)
4. [Authentication Flow](#authentication-flow)
5. [API & Backend Flow](#api--backend-flow)
6. [File Organization](#file-organization)
7. [Tech Stack](#tech-stack)

---

## 🏛️ High-Level Architecture

### **Three-Tier Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  React UI  │──│  Components  │──│  State Manager   │    │
│  │  (App.tsx) │  │  (26 files)  │  │  (useState)      │    │
│  └────────────┘  └──────────────┘  └──────────────────┘    │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                          │                                   │
│                          ▼                                   │
│              ┌─────────────────────┐                         │
│              │   API Client Layer  │                         │
│              │  /utils/apiClient.ts│                         │
│              └─────────────────────┘                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTPS Requests
                           │ Bearer Token Auth
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    BACKEND SERVER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Supabase Edge Function (Deno Runtime)             │  │
│  │    /supabase/functions/server/index.tsx              │  │
│  │                                                        │  │
│  │  - Hono Web Server Framework                          │  │
│  │  - REST API Endpoints (/projects, /features, etc.)   │  │
│  │  - Authentication Middleware                          │  │
│  │  - Business Logic                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ Supabase Client
                           │ Service Role Key
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   DATABASE LAYER                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Supabase PostgreSQL                      │  │
│  │                                                        │  │
│  │  Table: kv_store_bbcbebd7                            │  │
│  │  - Key-value storage for all app data                │  │
│  │  - Projects, Features, Categories, Audit Log         │  │
│  │                                                        │  │
│  │  Auth: Supabase Auth Service                         │  │
│  │  - User accounts, sessions, password reset           │  │
│  │                                                        │  │
│  │  Storage: (Future - file uploads)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Hierarchy

### **Visual Component Tree**

```
App.tsx (Root)
│
├── ErrorBoundary (Wrapper - catches all errors)
│   │
│   └── Main App Content
│       │
│       ├── Header
│       │   ├── Logo & Title
│       │   └── Account Dropdown
│       │       ├── AccountSettingsDialog
│       │       ├── ResetPasswordDialog
│       │       └── Delete Account AlertDialog
│       │
│       ├── Controls Bar
│       │   ├── SearchFilter
│       │   ├── Export/Import Button → ExportImportDialog
│       │   ├── Manage Features Button → ManageFeaturesDialog
│       │   └── Add Project Button → AddProjectDialog
│       │
│       └── Tabs (Main Content)
│           ├── Board View Tab
│           │   └── ProductProjectBoard
│           │       └── ProjectCard (multiple)
│           │           ├── EditProjectDialog
│           │           └── FeatureDeploymentDialog
│           │
│           ├── Timeline View Tab
│           │   └── TimelineView
│           │
│           ├── Features Matrix Tab
│           │   └── FeaturesMatrix
│           │
│           ├── Activity Log Tab
│           │   └── AuditLog
│           │
│           └── Admin Tab (if admin)
│               └── AdminPanel
│                   └── UserIdentityDialog
│
└── Toaster (Toast notifications)
```

### **Component Responsibility Map**

| Component | Purpose | Key Props | State |
|-----------|---------|-----------|-------|
| **App.tsx** | Root orchestrator | - | Auth, projects, features, categories |
| **ErrorBoundary** | Error catching | children | Error state |
| **AuthDialog** | Login/Signup | onAuthSuccess | Email, password, mode |
| **ProductProjectBoard** | Main board view | features, projects | - |
| **ProjectCard** | Individual project | project, features | Edit dialog state |
| **FeatureDeploymentDialog** | Feature tracking | feature, project | Status, notes, assignee |
| **ManageFeaturesDialog** | CRUD features | features, categoryOrder | Form state |
| **AddProjectDialog** | Create project | features, onAdd | Form state |
| **TimelineView** | Gantt chart | features, projects | - |
| **FeaturesMatrix** | Feature usage grid | features, projects | - |
| **AuditLog** | Activity history | entries | - |
| **AdminPanel** | User management | currentUserId | Users list, selected user |
| **SearchFilter** | Filtering UI | filters, onFilterChange | - |

---

## 🔄 Data Flow

### **1. Initial Load Flow**

```
┌─────────────────────────────────────────────────────────────┐
│  USER OPENS APP                                              │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  App.tsx: useEffect() runs on mount                          │
│  - checkSession()                                            │
│  - checkForPasswordReset()                                   │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
           ┌────────────┴────────────┐
           │                         │
           ▼                         ▼
    ┌──────────────┐        ┌───────────────┐
    │ Has Session? │   NO   │ Show AuthDialog│
    └──────┬───────┘        └───────────────┘
           │ YES                    │
           ▼                        │ Login Success
    ┌──────────────────┐            │
    │ handleAuthSuccess│◄───────────┘
    │ - setCurrentUser │
    │ - checkAdminStatus│
    │ - loadDataFromServer│
    └──────────┬───────┘
               ▼
    ┌──────────────────────────────────┐
    │ loadDataFromServer()             │
    │                                  │
    │ 1. Fetch from API:               │
    │    - getProjects()               │
    │    - getFeatures()               │
    │    - getCategories()             │
    │    - getAuditLog()               │
    │    - getTeamMembers()            │
    │                                  │
    │ 2. If no server data:            │
    │    - Check localStorage          │
    │    - Migrate to server OR        │
    │    - Use mock data               │
    │                                  │
    │ 3. Update React state            │
    │    - setProjects()               │
    │    - setFeatures()               │
    │    - setCategoryOrder()          │
    │    - setAuditLog()               │
    │    - setTeamMembers()            │
    └──────────┬───────────────────────┘
               ▼
    ┌──────────────────┐
    │   APP READY!     │
    │ Show main board  │
    └──────────────────┘
```

### **2. User Action Flow (Example: Creating a Project)**

```
User clicks "Add Project"
    │
    ▼
App.tsx: setIsAddDialogOpen(true)
    │
    ▼
AddProjectDialog opens
    │
    ▼
User fills form & clicks "Create"
    │
    ▼
AddProjectDialog: calls onAdd(project)
    │
    ▼
App.tsx: handleAddProject(project)
    │
    ├──► API: api.createProject(project)
    │       │
    │       └──► Server: POST /make-server-bbcbebd7/projects
    │               │
    │               └──► Database: kv.set('projects', [...])
    │                       │
    │                       └──► Returns success
    │
    ├──► State: setProjects([...projects, project])
    │
    ├──► Audit: addAuditEntry('create', 'project', ...)
    │       │
    │       └──► API: api.createAuditEntry(...)
    │
    └──► UI: toast.success('Project created')
         │
         └──► ProductProjectBoard re-renders with new project
```

### **3. Real-Time Collaboration Flow**

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   User A    │         │   Server    │         │   User B    │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │ Update project        │                       │
       ├──────────────────────►│                       │
       │                       │                       │
       │                       │ Save to DB            │
       │                       ├─────────┐             │
       │                       │◄────────┘             │
       │                       │                       │
       │ Success               │                       │
       │◄──────────────────────┤                       │
       │                       │                       │
       │                       │   Refresh page        │
       │                       │◄──────────────────────┤
       │                       │                       │
       │                       │ Load from DB          │
       │                       ├─────────┐             │
       │                       │◄────────┘             │
       │                       │                       │
       │                       │ Returns updated data  │
       │                       ├──────────────────────►│
       │                       │                       │
       │                       │      Sees changes!    │
       │                       │                       ▼
```

**Note**: This is manual refresh. For true real-time, you'd add Supabase Realtime subscriptions.

---

## 🔐 Authentication Flow

### **Complete Auth Journey**

```
┌─────────────────────────────────────────────────────────────┐
│  AUTHENTICATION FLOW                                         │
└─────────────────────────────────────────────────────────────┘

1. SIGNUP
   ┌──────────────┐
   │ User enters: │
   │ - Name       │
   │ - Email      │
   │ - Password   │
   └──────┬───────┘
          ▼
   ┌────────────────────────────────┐
   │ AuthDialog: handleSignup()     │
   │                                │
   │ POST /signup                   │
   │ {                              │
   │   email,                       │
   │   password,                    │
   │   user_metadata: { name }      │
   │ }                              │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────────────────────┐
   │ Server: /signup endpoint       │
   │                                │
   │ supabase.auth.admin.createUser │
   │ - Creates user                 │
   │ - Auto-confirms email          │
   │ - Returns user + session       │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────────────────────┐
   │ Returns { user, access_token } │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────────────────────┐
   │ App.tsx: handleAuthSuccess()   │
   │ - setCurrentUser(user)         │
   │ - localStorage: access_token   │
   │ - checkAdminStatus()           │
   │ - loadDataFromServer()         │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────┐
   │  USER LOGGED IN │
   └────────────────┘


2. LOGIN
   ┌──────────────┐
   │ User enters: │
   │ - Email      │
   │ - Password   │
   └──────┬───────┘
          ▼
   ┌────────────────────────────────┐
   │ AuthDialog: handleLogin()      │
   │                                │
   │ supabase.auth.signInWithPassword│
   │ - Client-side auth             │
   │ - No server endpoint needed    │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────────────────────┐
   │ Supabase Auth Service          │
   │ - Validates credentials        │
   │ - Returns session + user       │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────────────────────┐
   │ Returns { session, user }      │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────────────────────┐
   │ App.tsx: handleAuthSuccess()   │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────┐
   │  USER LOGGED IN │
   └────────────────┘


3. FORGOT PASSWORD
   ┌──────────────┐
   │ User enters: │
   │ - Email      │
   └──────┬───────┘
          ▼
   ┌────────────────────────────────┐
   │ AuthDialog: handleForgotPassword│
   │                                │
   │ POST /reset-password-request   │
   │ { email }                      │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────────────────────┐
   │ Server: /reset-password-request│
   │                                │
   │ supabase.auth.resetPasswordForEmail│
   │ - Sends reset email            │
   │ - Email contains magic link    │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────────────────────┐
   │ User checks email              │
   │ Clicks reset link              │
   │ Opens: app.com?reset-password=true│
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────────────────────┐
   │ App.tsx detects URL param      │
   │ Opens ResetPasswordDialog      │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────────────────────┐
   │ User enters new password       │
   │ POST /reset-password           │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────────────────────┐
   │ Server: Updates password       │
   │ supabase.auth.updateUser()     │
   └──────┬─────────────────────────┘
          ▼
   ┌─────────────────────┐
   │ PASSWORD RESET! ✅  │
   └─────────────────────┘


4. SESSION PERSISTENCE
   ┌────────────────────────────────┐
   │ User opens app (has session)   │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────────────────────┐
   │ App.tsx: checkSession()        │
   │                                │
   │ supabase.auth.getSession()     │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────────────────────┐
   │ Session found? ✅              │
   │ - Auto-login                   │
   │ - Skip AuthDialog              │
   └──────┬─────────────────────────┘
          ▼
   ┌────────────────┐
   │  USER LOGGED IN │
   └────────────────┘
```

---

## 🌐 API & Backend Flow

### **API Request Journey**

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND                                                    │
│                                                              │
│  Component calls: api.getProjects()                          │
│  (from /utils/apiClient.ts)                                  │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  API CLIENT LAYER (/utils/apiClient.ts)                      │
│                                                              │
│  async function getProjects() {                              │
│    return fetchWithAuth('/projects');                        │
│  }                                                           │
│                                                              │
│  fetchWithAuth():                                            │
│  1. Get config (projectId, publicAnonKey)                    │
│  2. Build URL: https://{projectId}.supabase.co/functions/...│
│  3. Add headers:                                             │
│     - Authorization: Bearer {accessToken}                    │
│     - Content-Type: application/json                         │
│  4. Set timeout: 30 seconds                                  │
│  5. Retry logic: 3 attempts                                  │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  NETWORK LAYER                                               │
│                                                              │
│  HTTPS Request                                               │
│  GET https://abc123.supabase.co/functions/v1/               │
│      make-server-bbcbebd7/projects                           │
│                                                              │
│  Headers:                                                    │
│    Authorization: Bearer eyJhbGci...                         │
│    Content-Type: application/json                            │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  SUPABASE EDGE FUNCTION (Deno Runtime)                       │
│  /supabase/functions/server/index.tsx                        │
│                                                              │
│  1. Request received by Hono server                          │
│  2. CORS middleware adds headers                             │
│  3. Logger middleware logs request                           │
│  4. Route matched: app.get('/make-server-bbcbebd7/projects') │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  AUTHENTICATION MIDDLEWARE                                   │
│                                                              │
│  const accessToken = request.headers.get('Authorization')   │
│  const { user, error } = await supabase.auth.getUser(token) │
│                                                              │
│  ┌─────────────────┐                                        │
│  │  User valid? ✅ │─── Continue                            │
│  └─────────────────┘                                        │
│                                                              │
│  ┌─────────────────┐                                        │
│  │  Invalid? ❌    │─── Return 401 Unauthorized             │
│  └─────────────────┘                                        │
└───────────────────────┬─────────────────────────────────────┘
                        ▼ (Authorized)
┌─────────────────────────────────────────────────────────────┐
│  BUSINESS LOGIC                                              │
│                                                              │
│  app.get('/make-server-bbcbebd7/projects', async (c) => {   │
│    // Get data from KV store                                │
│    const projects = await kv.get('projects');               │
│                                                              │
│    return c.json({                                          │
│      projects: projects || []                               │
│    });                                                       │
│  });                                                         │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE LAYER (/supabase/functions/server/kv_store.tsx)   │
│                                                              │
│  export async function get(key: string) {                    │
│    const { data } = await supabase                           │
│      .from('kv_store_bbcbebd7')                              │
│      .select('value')                                        │
│      .eq('key', key)                                         │
│      .single();                                              │
│                                                              │
│    return data?.value;                                       │
│  }                                                           │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  POSTGRES DATABASE                                           │
│                                                              │
│  Table: kv_store_bbcbebd7                                    │
│  ┌──────────┬────────────────────────┐                      │
│  │   key    │        value           │                      │
│  ├──────────┼────────────────────────┤                      │
│  │ projects │ [{ id: 'p1', ... }]    │                      │
│  │ features │ [{ id: 'f1', ... }]    │                      │
│  │ categories│ ['Security', ...]      │                      │
│  │ audit_log│ [{ id: 'a1', ... }]    │                      │
│  └──────────┴────────────────────────┘                      │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  RESPONSE FLOWS BACK                                         │
│                                                              │
│  Database → KV Store → Business Logic → Edge Function →     │
│  Network → API Client → Component                            │
│                                                              │
│  Component receives:                                         │
│  {                                                           │
│    data: {                                                   │
│      projects: [...]                                         │
│    },                                                        │
│    error: null                                               │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### **API Endpoints Map**

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/signup` | POST | No | Create new user account |
| `/reset-password-request` | POST | No | Send password reset email |
| `/reset-password` | POST | Yes | Update password |
| `/projects` | GET | Yes | Fetch all projects |
| `/projects` | POST | Yes | Create new project |
| `/projects/:id` | PUT | Yes | Update project |
| `/projects/:id` | DELETE | Yes | Delete project |
| `/features` | GET | Yes | Fetch all features |
| `/features` | POST | Yes | Create new feature |
| `/features/:id` | PUT | Yes | Update feature |
| `/features/:id` | DELETE | Yes | Delete feature |
| `/categories` | GET | Yes | Fetch category order |
| `/categories` | PUT | Yes | Update category order |
| `/audit-log` | GET | Yes | Fetch audit log |
| `/audit-log` | POST | Yes | Create audit entry |
| `/team-members` | GET | Yes | Fetch all team members |
| `/admin/check` | GET | Yes | Check admin status |
| `/admin/users` | GET | Yes (Admin) | List all users |
| `/admin/users/:id/role` | PUT | Yes (Admin) | Update user role |
| `/admin/users/:id` | DELETE | Yes (Admin) | Delete user |
| `/delete-my-account` | DELETE | Yes | Delete own account |
| `/initialize-data` | POST | Yes | Bulk data upload |

---

## 📁 File Organization

### **Directory Structure Explained**

```
root/
│
├── 📄 App.tsx                        ← ENTRY POINT - Main orchestrator
│                                       - Manages auth state
│                                       - Loads data
│                                       - Renders UI hierarchy
│
├── 📁 components/                    ← UI COMPONENTS (21 files)
│   ├── 🔐 Auth Components
│   │   ├── AuthDialog.tsx            ← Login/Signup form
│   │   ├── AccountSettingsDialog.tsx ← User profile editing
│   │   └── ResetPasswordDialog.tsx   ← Password reset form
│   │
│   ├── 📊 Project Management
│   │   ├── ProductProjectBoard.tsx   ← Main board layout
│   │   ├── ProjectCard.tsx           ← Individual project display
│   │   ├── AddProjectDialog.tsx      ← New project form
│   │   ├── EditProjectDialog.tsx     ← Edit project form
│   │   └── FeatureDeploymentDialog.tsx ← Feature tracking
│   │
│   ├── ✨ Feature Management
│   │   ├── ManageFeaturesDialog.tsx  ← CRUD features
│   │   └── FeaturesMatrix.tsx        ← Feature usage grid
│   │
│   ├── 📈 Views
│   │   ├── TimelineView.tsx          ← Gantt chart
│   │   └── FeaturesMatrix.tsx        ← Feature matrix
│   │
│   ├── 🔧 Utilities
│   │   ├── SearchFilter.tsx          ← Search/filter UI
│   │   ├── AuditLog.tsx              ← Activity history
│   │   ├── ExportImportDialog.tsx    ← Data backup/restore
│   │   └── ErrorBoundary.tsx         ← Error handling
│   │
│   ├── 👑 Admin
│   │   ├── AdminPanel.tsx            ← User management
│   │   └── UserIdentityDialog.tsx    ← User details modal
│   │
│   ├── 📁 ui/                        ← SHADCN COMPONENTS (42 files)
│   │   └── [button, dialog, card...] ← Reusable UI primitives
│   │
│   └── 📁 figma/
│       └── ImageWithFallback.tsx     ← Image component
│
├── 📁 utils/                         ← UTILITIES & HELPERS
│   ├── 🌐 API Layer
│   │   ├── api.ts                    ← OLD API client (to be replaced)
│   │   └── apiClient.ts              ← NEW enhanced API client
│   │                                   - Retry logic
│   │                                   - Timeout handling
│   │                                   - Network detection
│   │
│   ├── ⚠️ Error Handling
│   │   ├── errorHandling.ts          ← Error utilities
│   │   │                               - parseError()
│   │   │                               - showError()
│   │   │                               - withRetry()
│   │   │                               - NetworkMonitor
│   │   │
│   │   └── config.ts                 ← Environment config
│   │                                   - getConfig()
│   │                                   - Platform-independent
│   │
│   └── 📁 supabase/                  ← SUPABASE CLIENT
│       ├── client.ts                 ← Supabase singleton
│       └── info.tsx                  ← Project credentials
│
├── 📁 supabase/functions/server/     ← BACKEND SERVER
│   ├── index.tsx                     ← MAIN SERVER FILE
│   │                                   - Hono app
│   │                                   - All API endpoints
│   │                                   - Auth middleware
│   │                                   - CORS setup
│   │
│   └── kv_store.tsx                  ← DATABASE UTILITIES
│                                       - get(), set(), del()
│                                       - mget(), mset(), mdel()
│                                       - getByPrefix()
│
├── 📁 styles/                        ← STYLING
│   └── globals.css                   ← Tailwind + custom styles
│
├── 📁 docs/                          ← ORGANIZED DOCUMENTATION
│   ├── getting-started/              ← Onboarding guides
│   ├── user-guides/                  ← Feature documentation
│   ├── admin-guides/                 ← Admin documentation
│   └── project/                      ← Project info
│
└── 📄 [23 .md files]                 ← ROOT DOCUMENTATION
                                        (Consider moving to /docs)
```

### **Import Patterns**

```typescript
// ✅ Component imports (relative paths)
import { ProductProjectBoard } from './components/ProductProjectBoard';
import { Button } from './components/ui/button';

// ✅ Utility imports (relative paths)
import * as api from './utils/apiClient';  // ← Use this one!
import { parseError } from './utils/errorHandling';

// ✅ Supabase imports
import { supabase } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';

// ✅ Package imports
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { Loader2, Plus } from 'lucide-react';

// ✅ Asset imports
import logoImage from 'figma:asset/...';
```

---

## 🛠️ Tech Stack

### **Frontend**

| Technology | Purpose | Location |
|------------|---------|----------|
| **React 18** | UI framework | All `.tsx` files |
| **TypeScript** | Type safety | All `.ts/.tsx` files |
| **Tailwind CSS v4** | Styling | `styles/globals.css` |
| **Shadcn UI** | Component library | `components/ui/` |
| **Lucide React** | Icons | `import { Icon } from 'lucide-react'` |
| **Sonner** | Toast notifications | `components/ui/sonner.tsx` |
| **Recharts** | Charts (Timeline) | `components/TimelineView.tsx` |

### **Backend**

| Technology | Purpose | Location |
|------------|---------|----------|
| **Supabase Edge Functions** | Serverless backend | `supabase/functions/server/` |
| **Deno Runtime** | JavaScript runtime | Server environment |
| **Hono** | Web framework | `index.tsx` |
| **Supabase Auth** | Authentication | Built-in service |
| **PostgreSQL** | Database | Supabase-hosted |
| **KV Store** | Data storage pattern | `kv_store.tsx` |

### **DevOps**

| Tool | Purpose |
|------|---------|
| **Supabase** | Hosting platform |
| **Git** | Version control |
| **Figma** | Design source |

---

## 🎯 Key Architectural Decisions

### **1. Why Key-Value Store?**
- **Flexibility**: No schema migrations needed
- **Simplicity**: Easy CRUD operations
- **Prototyping**: Perfect for rapid iteration
- **Trade-off**: Less query power than relational tables

### **2. Why Three-Tier Architecture?**
- **Separation of Concerns**: UI, logic, data separate
- **Security**: Backend validates, frontend displays
- **Scalability**: Can replace any tier independently
- **Maintainability**: Clear boundaries

### **3. Why Supabase?**
- **All-in-one**: Database + Auth + Storage + Functions
- **PostgreSQL**: Powerful, reliable database
- **Real-time**: Can add live subscriptions later
- **Developer-friendly**: Great DX, good docs

### **4. Why TypeScript Everywhere?**
- **Type Safety**: Catch errors before runtime
- **IntelliSense**: Better developer experience
- **Refactoring**: Safer code changes
- **Documentation**: Types as inline docs

---

## 🔍 How to Trace a Feature

### **Example: "How does editing a project work?"**

**1. Find the UI Component**
```
Search files for: "Edit Project"
Found in: ProjectCard.tsx → EditProjectDialog.tsx
```

**2. Follow the Event Handler**
```typescript
// ProjectCard.tsx
<Button onClick={() => setIsEditDialogOpen(true)}>
  Edit
</Button>

// EditProjectDialog.tsx
<Button onClick={handleSave}>
  Save Changes
</Button>

const handleSave = () => {
  onUpdate(editedProject); // ← Calls parent function
};
```

**3. Trace Up to Parent**
```typescript
// ProjectCard.tsx
<EditProjectDialog onUpdate={onUpdate} />

// Receives from parent:
export function ProjectCard({ onUpdate, ... }) {
  // onUpdate comes from ProductProjectBoard
}
```

**4. Trace to App.tsx**
```typescript
// ProductProjectBoard.tsx
<ProjectCard onUpdate={onUpdateProject} />

// App.tsx
<ProductProjectBoard onUpdateProject={handleUpdateProject} />

const handleUpdateProject = async (updatedProject) => {
  // 1. Call API
  await api.updateProject(updatedProject.id, updatedProject);
  
  // 2. Update state
  setProjects(projects.map(p => 
    p.id === updatedProject.id ? updatedProject : p
  ));
  
  // 3. Log action
  await addAuditEntry('update', 'project', ...);
  
  // 4. Show feedback
  toast.success('Project updated');
};
```

**5. Follow to API Layer**
```typescript
// utils/apiClient.ts
export async function updateProject(id, data) {
  return fetchWithAuth(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
```

**6. Trace to Backend**
```typescript
// supabase/functions/server/index.tsx
app.put('/make-server-bbcbebd7/projects/:id', async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  
  // Get existing projects
  const projects = await kv.get('projects') || [];
  
  // Update the project
  const updated = projects.map(p => 
    p.id === id ? { ...p, ...data } : p
  );
  
  // Save back
  await kv.set('projects', updated);
  
  return c.json({ success: true });
});
```

**7. Reach the Database**
```typescript
// kv_store.tsx
export async function set(key: string, value: any) {
  await supabase
    .from('kv_store_bbcbebd7')
    .upsert({ key, value });
}
```

---

## 📚 Next Steps

Now that you understand the architecture:

1. **Read the Code**: Start with `App.tsx` and follow the imports
2. **Trace a Feature**: Pick any feature and trace it end-to-end
3. **Make Changes**: Try modifying a component
4. **Add a Feature**: Use the patterns you see
5. **Review Docs**: Check `/docs` for specific guides

---

## 🤔 Common Questions

**Q: Where do I add a new API endpoint?**
A: Add it to `supabase/functions/server/index.tsx` and create a corresponding function in `utils/apiClient.ts`

**Q: How do I add a new React component?**
A: Create it in `components/`, import it in `App.tsx` or parent component

**Q: Where is user data stored?**
A: In PostgreSQL table `kv_store_bbcbebd7` as key-value pairs

**Q: How do I debug an API call?**
A: Check browser DevTools Network tab, or check server logs in Supabase dashboard

**Q: Can I add a new database table?**
A: Not recommended - use the KV store pattern. If you must, you'll need Supabase dashboard access for migrations.

---

**You now have a complete map of the application! 🗺️**

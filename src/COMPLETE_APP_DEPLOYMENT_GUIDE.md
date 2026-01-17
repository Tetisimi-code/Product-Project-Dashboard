# 🚀 Complete App Deployment Guide

> **Step-by-step guide to turn your Figma Make project into a production-ready app**

This guide covers **EVERYTHING** - frontend setup, Supabase backend, email service, and deployment.

---

## 📋 **What You'll Need**

Before starting, gather these:

- [ ] **Node.js 18+** - [Download](https://nodejs.org/)
- [ ] **VS Code** - [Download](https://code.visualstudio.com/)
- [ ] **Supabase Account** - [Sign up free](https://supabase.com)
- [ ] **Resend Account** - [Sign up free](https://resend.com)
- [ ] **Your Figma Make files** (you already have these!)

**Time Required:** 60-90 minutes total

---

## 🗺️ **Overview - What We're Building**

```
Your App = Frontend + Backend + Email Service + Deployment

┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vite + React)              │
│  • Your React components                                │
│  • Tailwind CSS styling                                 │
│  • Deployed to Vercel/Netlify                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Supabase)                         │
│  • PostgreSQL Database (project data)                   │
│  • Authentication (user login/signup)                   │
│  • Edge Functions (server API)                          │
│  • Storage (if needed)                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              EMAIL SERVICE (Resend)                     │
│  • Verification emails                                  │
│  • Password reset emails                                │
└─────────────────────────────────────────────────────────┘
```

---

# PART 1: Create Your Local Development Environment

## Step 1: Download Your Files

**From Figma Make, download ALL files:**

1. Click the "Download" or "Export" button in Figma Make
2. Save to a folder on your Desktop: `reactive-app-backup`
3. Verify you have these folders:
   - ✅ `components/`
   - ✅ `styles/`
   - ✅ `utils/`
   - ✅ `supabase/`
   - ✅ And `App.tsx`

---

## Step 2: Create New Vite Project

Open your terminal (Terminal on Mac, Command Prompt on Windows):

```bash
# Navigate to where you want to create the project
cd Desktop

# Create new Vite project
npm create vite@latest reactive-project-board -- --template react-ts

# Enter the project folder
cd reactive-project-board

# Open in VS Code
code .
```

**✅ Checkpoint:** VS Code should now be open with your new project

---

## Step 3: Install Dependencies

In VS Code, open the terminal (Terminal → New Terminal) and run:

### 3.1 Core Dependencies

```bash
# React libraries
npm install lucide-react date-fns

# Tailwind CSS v4
npm install tailwindcss@4 @tailwindcss/vite

# Utility libraries
npm install class-variance-authority clsx tailwind-merge
```

### 3.2 Radix UI Components (for Shadcn)

```bash
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-tooltip
```

### 3.3 Additional UI & Utilities

```bash
npm install sonner@2.0.3 cmdk vaul recharts input-otp
```

### 3.4 Supabase Client

```bash
npm install @supabase/supabase-js
```

**✅ Checkpoint:** Check `package.json` - you should see all these packages listed

---

## Step 4: Copy Your Files

### 4.1 Delete Default Files

In VS Code file explorer, delete these:
- ❌ `src/App.tsx`
- ❌ `src/App.css`
- ❌ `src/index.css`

### 4.2 Copy Your Files

Copy from your `reactive-app-backup` folder to the new project:

```
Copy from backup → To new project

App.tsx                    → src/App.tsx
components/                → src/components/
styles/                    → src/styles/
utils/                     → src/utils/
supabase/                  → src/supabase/
```

**Your `src/` folder should now look like:**

```
src/
├── App.tsx
├── components/
│   ├── AccountSettingsDialog.tsx
│   ├── AddProjectDialog.tsx
│   ├── AdminPanel.tsx
│   ├── AuditLog.tsx
│   ├── AuthDialog.tsx
│   ├── EditProjectDialog.tsx
│   ├── ErrorBoundary.tsx
│   ├── ... (all your components)
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   └── ui/
│       └── ... (all shadcn components)
├── styles/
│   └── globals.css
├── utils/
│   ├── api.ts
│   ├── apiClient.ts
│   ├── config.ts
│   ├── errorHandling.ts
│   └── supabase/
│       ├── client.ts
│       └── info.tsx
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx
│           └── kv_store.tsx
└── main.tsx (existing)
```

**✅ Checkpoint:** All files copied? Check in VS Code file explorer.

---

## Step 5: Configure Vite

### 5.1 Update `vite.config.ts`

Replace the entire file with:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 5.2 Update `src/main.tsx`

Replace the entire file with:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 5.3 Update `tsconfig.json`

Add these compiler options:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**✅ Checkpoint:** Config files updated

---

# PART 2: Set Up Supabase Backend

## Step 6: Create Supabase Project

### 6.1 Create Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name:** `reactive-project-board`
   - **Database Password:** Choose a strong password (SAVE THIS!)
   - **Region:** Choose closest to you
   - **Plan:** Free tier is fine
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to set up

### 6.2 Get Your Supabase Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy and save these values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
Project ID: xxxxxxxxxxxxx (from the URL)
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT:** Keep these secret! Don't share publicly.

**✅ Checkpoint:** You have 4 values saved

---

## Step 7: Configure Supabase Database

### 7.1 The KV Store Table Already Exists!

Good news! The `kv_store_bbcbebd7` table is automatically created by your edge functions. You don't need to create it manually.

But let's verify it will work:

1. Go to **SQL Editor** in Supabase dashboard
2. Run this query to check if table exists (it will after first deploy):

```sql
-- This will create the table if it doesn't exist (edge function does this automatically)
-- You don't need to run this, but it shows what the edge function creates
```

**✅ Checkpoint:** Database is ready (table will be auto-created)

---

## Step 8: Deploy Supabase Edge Functions

Your edge functions need to be deployed to Supabase.

### 8.1 Install Supabase CLI

**On Mac:**
```bash
brew install supabase/tap/supabase
```

**On Windows:**
```bash
# Using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Verify installation:**
```bash
supabase --version
```

### 8.2 Login to Supabase

```bash
supabase login
```

This opens your browser - authorize the CLI.

### 8.3 Link Your Project

In your project folder:

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with the ID from step 6.2.

Enter your database password when prompted.

### 8.4 Set Environment Secrets

Your edge functions need these secrets:

```bash
# Set Supabase URL
supabase secrets set SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Set Supabase Service Role Key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Set Supabase Anon Key
supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Set Database URL (from Supabase Settings → Database → Connection String → URI)
supabase secrets set SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

**Replace the values with your actual keys from step 6.2!**

### 8.5 Deploy Edge Functions

```bash
supabase functions deploy server
```

**✅ Checkpoint:** You should see "Function deployed successfully"

---

## Step 9: Set Up Resend Email Service

### 9.1 Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up (free)
3. Go to **API Keys**
4. Click **"Create API Key"**
5. Name: `reactive-project-board`
6. Copy the API key (starts with `re_...`)

### 9.2 Add Resend Key to Supabase

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

Replace with your actual Resend API key.

### 9.3 Test Email (Testing Mode)

For now, you can only send emails to the email address you used to sign up for Resend.

To enable team signups, you need to verify your domain:
- **See:** [ENABLE_TEAM_ACCESS.md](./ENABLE_TEAM_ACCESS.md)
- **Quick:** Takes 15-20 minutes
- **Cost:** FREE

**✅ Checkpoint:** Resend configured

---

## Step 10: Update Frontend Configuration

### 10.1 Update `src/utils/supabase/info.tsx`

Replace with your actual Supabase credentials:

```typescript
// Supabase project configuration
export const projectId = 'xxxxxxxxxxxxx'; // Your project ID
export const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Your anon key
```

**⚠️ NEVER put `service_role` key in frontend code!**

### 10.2 Verify `src/utils/supabase/client.ts`

Should look like:

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, publicAnonKey);
};
```

**✅ Checkpoint:** Frontend configured with Supabase credentials

---

# PART 3: Test Locally

## Step 11: Test Your App Locally

### 11.1 Start Development Server

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 11.2 Open in Browser

1. Open `http://localhost:5173`
2. Your app should load!

### 11.3 Test Authentication

1. Click **"Sign Up"**
2. Use the email address you signed up to Resend with
3. Create a password
4. Check your email for verification code
5. Enter code
6. You should be logged in!

### 11.4 Test Features

- ✅ Create a project
- ✅ Add features
- ✅ Edit project
- ✅ View timeline
- ✅ Check features matrix
- ✅ Export data
- ✅ Logout and login again
- ✅ Data should persist!

**✅ Checkpoint:** Everything working locally!

---

# PART 4: Deploy to Production

## Step 12: Choose Deployment Platform

I recommend **Vercel** (easiest) or **Netlify**.

---

## Option A: Deploy to Vercel (Recommended)

### Step 12A.1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 12A.2: Build Your App

```bash
npm run build
```

This creates a `dist/` folder.

### Step 12A.3: Deploy

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **What's your project name?** reactive-project-board
- **In which directory is your code?** ./ (just press Enter)
- **Want to override settings?** No

Vercel will:
1. Upload your code
2. Build it
3. Deploy it
4. Give you a URL!

### Step 12A.4: Set Environment Variables

After deploy, set these in Vercel dashboard:

1. Go to [vercel.com](https://vercel.com)
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add (these will be used for build, not runtime - Supabase keys are in your code):
   - No environment variables needed! (Your Supabase info is in `info.tsx`)

### Step 12A.5: Production Deploy

```bash
vercel --prod
```

**✅ You're live!** Vercel gives you a URL like: `https://reactive-project-board.vercel.app`

---

## Option B: Deploy to Netlify

### Step 12B.1: Build Your App

```bash
npm run build
```

### Step 12B.2: Deploy with Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

When prompted:
- **Publish directory:** `dist`

### Step 12B.3: Configure

Netlify auto-configures. No extra environment variables needed (Supabase info is in your code).

**✅ You're live!** Netlify gives you a URL like: `https://reactive-project-board.netlify.app`

---

## Option C: Deploy to GitHub Pages

### Step 12C.1: Push to GitHub

1. Create a new repository on [github.com](https://github.com)
2. Name it: `reactive-project-board`
3. In your terminal:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/reactive-project-board.git
git push -u origin main
```

### Step 12C.2: Install gh-pages

```bash
npm install --save-dev gh-pages
```

### Step 12C.3: Update `package.json`

Add:
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/reactive-project-board",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### Step 12C.4: Update `vite.config.ts`

```typescript
export default defineConfig({
  base: '/reactive-project-board/', // Add this line
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Step 12C.5: Deploy

```bash
npm run deploy
```

**✅ You're live!** Your app is at: `https://YOUR_USERNAME.github.io/reactive-project-board`

---

# PART 5: Post-Deployment Setup

## Step 13: Enable Team Access (Optional but Recommended)

Currently, only the email you used for Resend can receive verification emails.

To enable team signups:

1. **Verify your domain in Resend** (15-20 minutes, free)
   - See: [ENABLE_TEAM_ACCESS.md](./ENABLE_TEAM_ACCESS.md)
   - This allows any `@your-domain.com` email to sign up

2. **Update server code** after domain verification:
   - In your edge function (`src/supabase/functions/server/index.tsx`)
   - Change `from: 'onboarding@resend.dev'` 
   - To: `from: 'noreply@your-domain.com'`
   - Redeploy: `supabase functions deploy server`

**See:** [DOMAIN_VERIFICATION_STEPS.md](./DOMAIN_VERIFICATION_STEPS.md)

---

## Step 14: Configure CORS for Your Domain

Your edge function needs to allow requests from your deployment domain.

### 14.1 Update Edge Function CORS

Edit `src/supabase/functions/server/index.tsx`:

Find the CORS configuration (around line 20):

```typescript
app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'https://your-actual-deployment-url.vercel.app', // Add your real URL
  ],
  credentials: true,
}));
```

### 14.2 Redeploy Edge Function

```bash
supabase functions deploy server
```

**✅ Checkpoint:** CORS configured for your domain

---

## Step 15: Test Production Deployment

### 15.1 Open Your Live URL

Go to your deployed URL (from Vercel/Netlify/GitHub Pages)

### 15.2 Complete Testing

- ✅ Sign up with your email
- ✅ Receive verification email
- ✅ Verify account
- ✅ Login
- ✅ Create projects
- ✅ Add features
- ✅ Test all features
- ✅ Logout and login again
- ✅ Data persists!

### 15.3 Test Admin Features

1. Make yourself admin:
   - Go to Supabase Dashboard
   - **Table Editor** → `kv_store_bbcbebd7`
   - Find key: `admins`
   - Add your email to the value array

2. Refresh your app
3. You should see "Admin" tab
4. Test user management

**✅ Checkpoint:** Production app fully working!

---

# 🎉 SUCCESS CHECKLIST

- [ ] **Local development works** (npm run dev)
- [ ] **Supabase project created** and configured
- [ ] **Edge functions deployed** to Supabase
- [ ] **Resend API key** configured
- [ ] **Frontend deployed** to Vercel/Netlify/GitHub Pages
- [ ] **Authentication works** (signup, login, verify email)
- [ ] **Data persists** (projects, features, users)
- [ ] **Admin panel** accessible and working
- [ ] **Team can sign up** (after domain verification)
- [ ] **Production URL** shared with team

---

# 📚 **Next Steps**

### **For Your Team:**
1. Share your deployment URL
2. Send [TEAM_SHARING_GUIDE.md](./TEAM_SHARING_GUIDE.md)
3. Point to [Quick Start Guide](./docs/getting-started/QUICK_START.md)

### **Enable Team Access:**
1. Verify domain in Resend (15 min)
   - [ENABLE_TEAM_ACCESS.md](./ENABLE_TEAM_ACCESS.md)
2. Update edge function email `from` address
3. Redeploy edge function

### **Customize:**
1. Update branding/colors
2. Add your logo
3. Customize email templates
4. Add custom domain

---

# 🆘 **Troubleshooting**

## Common Issues

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Edge function not working
```bash
# Check logs
supabase functions logs server

# Verify secrets
supabase secrets list
```

### Authentication not working
1. Check Supabase credentials in `src/utils/supabase/info.tsx`
2. Verify edge function is deployed
3. Check Resend API key
4. Check browser console for errors

### Emails not sending
1. Verify Resend API key: `supabase secrets list`
2. Check email in Resend dashboard logs
3. Check spam folder
4. Verify domain if using custom domain

### Data not persisting
1. Check Supabase is connected (browser console)
2. Verify edge function deployed
3. Check network tab for API errors
4. Verify auth token is valid

### Deployment fails
```bash
# Clear build cache
rm -rf dist node_modules
npm install
npm run build
```

## Getting Help

- **Architecture:** [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)
- **Troubleshooting:** [docs/troubleshooting/](./docs/troubleshooting/)
- **Email Issues:** [docs/troubleshooting/EMAIL_ISSUES.md](./docs/troubleshooting/EMAIL_ISSUES.md)
- **Login Issues:** [docs/troubleshooting/LOGIN_ISSUES.md](./docs/troubleshooting/LOGIN_ISSUES.md)

---

# 📊 **Summary**

You now have:
- ✅ **Frontend** deployed to Vercel/Netlify/GitHub Pages
- ✅ **Backend** running on Supabase (database + auth + edge functions)
- ✅ **Email service** configured with Resend
- ✅ **Real-time collaboration** with cloud database
- ✅ **Secure authentication** with email verification
- ✅ **Production-ready** app accessible to your team

**Total time:** 60-90 minutes  
**Total cost:** $0 (using free tiers)

---

## 🎯 **Architecture Summary**

```
┌──────────────────────────────────────────────────────┐
│  FRONTEND (Vercel/Netlify)                           │
│  https://your-app.vercel.app                         │
│  • React + TypeScript                                │
│  • Tailwind CSS                                      │
│  • All your components                               │
└────────────────┬─────────────────────────────────────┘
                 │
                 ↓ API Calls
┌──────────────────────────────────────────────────────┐
│  SUPABASE EDGE FUNCTIONS                             │
│  https://PROJECT_ID.supabase.co/functions/v1/        │
│  make-server-bbcbebd7/*                              │
│  • Deno runtime                                      │
│  • Hono web framework                                │
│  • Handles all backend logic                         │
└────────────────┬─────────────────────────────────────┘
                 │
      ┌──────────┴─────────┬─────────────┐
      ↓                    ↓             ↓
┌────────────┐  ┌──────────────┐  ┌──────────────┐
│ PostgreSQL │  │ Auth Service │  │ Resend Email │
│ Database   │  │ (Supabase)   │  │ Service      │
│            │  │              │  │              │
│ Projects   │  │ Users        │  │ Verification │
│ Features   │  │ Sessions     │  │ Password     │
│ Categories │  │ Tokens       │  │ Reset        │
└────────────┘  └──────────────┘  └──────────────┘
```

---

**🎊 Congratulations! Your app is live!** 🎊

**Questions?** Check [MASTER_INDEX.md](./docs/MASTER_INDEX.md) for all documentation.

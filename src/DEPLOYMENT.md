# Deployment Guide - Reactive Technologies Project Board

> **⚠️ IMPORTANT: This guide is for basic frontend-only deployment.**
> 
> **Your app uses Supabase backend + authentication + email service!**
> 
> **→ Use the comprehensive guide instead:** [COMPLETE_APP_DEPLOYMENT_GUIDE.md](./COMPLETE_APP_DEPLOYMENT_GUIDE.md)
> 
> **→ Or the quick version:** [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)

---

## 🎯 **Choose Your Guide**

| Guide | Best For | Time | Includes |
|-------|----------|------|----------|
| **[COMPLETE_APP_DEPLOYMENT_GUIDE.md](./COMPLETE_APP_DEPLOYMENT_GUIDE.md)** | First-time deployers | 60-90 min | Frontend + Supabase + Resend + Everything! ✅ |
| **[DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)** | Experienced developers | 60 min | Quick reference version ⚡ |
| **This guide** | Frontend only (no backend) | 30 min | Basic Vite setup ⚠️ Limited functionality |

---

## ⚠️ **What This Guide Does NOT Include**

This guide only covers:
- ✅ Creating a Vite project
- ✅ Installing dependencies
- ✅ Deploying frontend to Vercel/Netlify/GitHub Pages

This guide does NOT cover:
- ❌ Supabase backend setup (required for authentication)
- ❌ Database configuration (required for data persistence)
- ❌ Edge functions deployment (required for API)
- ❌ Resend email service (required for verification emails)
- ❌ Environment variables setup

**Without these, your app will not have:**
- ❌ User authentication (login/signup)
- ❌ Data persistence (all data lost on refresh)
- ❌ Email verification
- ❌ Team collaboration
- ❌ Admin features

---

## 🚀 **Recommended: Use the Complete Guide**

**→ [COMPLETE_APP_DEPLOYMENT_GUIDE.md](./COMPLETE_APP_DEPLOYMENT_GUIDE.md)**

It includes:
1. ✅ Everything in this guide
2. ✅ Supabase backend setup
3. ✅ Edge functions deployment
4. ✅ Resend email configuration
5. ✅ Complete testing checklist
6. ✅ Troubleshooting guide

**Time:** 60-90 minutes  
**Result:** Fully functional production app

---

# Basic Frontend-Only Deployment

> **Note:** This creates a static app with no backend. Data will reset on page reload.

## Prerequisites

- Node.js 18+ installed ([Download here](https://nodejs.org/))
- Visual Studio Code ([Download here](https://code.visualstudio.com/))
- Git (optional, for version control)

## Step 1: Download Your Current Files

From your current Figma Make project, download ALL files and folders:
- `App.tsx`
- `components/` folder (with all subfolders)
- `styles/` folder
- Your logo image

Save them somewhere accessible on your computer (e.g., Desktop/reactive-backup).

## Step 2: Create a New Vite Project

Open your terminal (or VS Code's integrated terminal) and run:

```bash
npm create vite@latest reactive-project-board -- --template react-ts
cd reactive-project-board
```

## Step 3: Open in Visual Studio Code

```bash
code .
```

This opens the new project in VS Code.

## Step 4: Install Dependencies

In VS Code's terminal (Terminal → New Terminal), run:

```bash
# Core dependencies
npm install lucide-react date-fns

# Tailwind CSS v4
npm install tailwindcss@4 @tailwindcss/vite

# Utility libraries
npm install class-variance-authority clsx tailwind-merge

# Radix UI components (for shadcn/ui)
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-tooltip

# Additional UI libraries
npm install sonner@2.0.3 cmdk vaul
```

## Step 5: Copy Your Files to the New Project

Using VS Code's file explorer or your system's file manager:

**Delete these default files:**
- `src/App.tsx` (you'll replace it)
- `src/App.css`
- `src/index.css`

**Copy from your backup folder to the new project:**
1. Copy `App.tsx` → `src/App.tsx`
2. Copy entire `components/` folder → `src/components/`
3. Copy entire `styles/` folder → `src/styles/`
4. Copy your logo image → `src/assets/logo.png`

Your `src/` folder should now look like:
```
src/
├── assets/
│   └── logo.png
├── components/
│   ├── AddProjectDialog.tsx
│   ├── EditProjectDialog.tsx
│   ├── FeaturesMatrix.tsx
│   ├── ManageFeaturesDialog.tsx
│   ├── ProductProjectBoard.tsx
│   ├── ProjectCard.tsx
│   ├── TimelineView.tsx
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   └── ui/
│       └── (all your UI components)
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

## Step 6: Update File Imports

### 6.1 Update `src/App.tsx`

Find this line (around line 10):
```typescript
import logoImage from 'figma:asset/54d312aed3f16e91c436bfb4f646101be4eacef7.png';
```

Replace with:
```typescript
import logoImage from './assets/logo.png';
```

### 6.2 Update `src/main.tsx`

Replace the entire contents with:
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

### 6.3 Update `vite.config.ts`

Replace the entire contents with:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

## Step 7: Test Locally

In VS Code's terminal, run:
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser. Your application should be running!

## Step 8: Build for Production

Once everything works locally:

```bash
npm run build
```

This creates a `dist/` folder with your production-ready files.

## Step 9: Deploy

### Option 1: Vercel (Easiest - Recommended)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New Project"
3. Import your project (either by pushing to GitHub first, or drag-drop the folder)
4. Vercel auto-detects Vite settings
5. Click "Deploy"

**OR use Vercel CLI:**
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify

1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag and drop your `dist/` folder to Netlify's deploy area
3. Done!

**OR use Netlify CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```
Select `dist` as the publish directory.

### Option 3: GitHub Pages

1. Push your code to GitHub first
2. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Update `package.json` - add these lines:
   ```json
   {
     "homepage": "https://yourusername.github.io/reactive-project-board",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. Update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/reactive-project-board/',
     plugins: [react(), tailwindcss()],
   })
   ```

5. Deploy:
   ```bash
   npm run deploy
   ```

## Troubleshooting

### "Module not found" errors
- Make sure you ran `npm install` to install all dependencies
- Check import paths use `./` for relative imports

### Styles not loading
- Verify `globals.css` is imported in `main.tsx`
- Check that `@tailwindcss/vite` plugin is in `vite.config.ts`

### Logo not displaying
- Ensure logo is saved in `src/assets/logo.png`
- Check the import in `App.tsx` matches the file location

### Port 5173 already in use
```bash
npm run dev -- --port 3000
```

## Adding Data Persistence (Optional)

Currently, your data resets on page reload. To save data between sessions:

### LocalStorage Method (No backend needed)

Add to the top of `App.tsx` after your state declarations:

```typescript
import { useEffect } from 'react';

// Inside your App component, after state declarations:

// Load data on mount
useEffect(() => {
  const savedFeatures = localStorage.getItem('features');
  const savedProjects = localStorage.getItem('projects');
  
  if (savedFeatures) {
    setFeatures(JSON.parse(savedFeatures));
  }
  if (savedProjects) {
    setProjects(JSON.parse(savedProjects));
  }
}, []);

// Save data whenever it changes
useEffect(() => {
  localStorage.setItem('features', JSON.stringify(features));
}, [features]);

useEffect(() => {
  localStorage.setItem('projects', JSON.stringify(projects));
}, [projects]);
```

## VS Code Extensions (Recommended)

Install these extensions in VS Code for better development:
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **Prettier - Code formatter**
- **ESLint**

## Summary

1. ✅ Download all your files from Figma Make
2. ✅ Create new Vite project
3. ✅ Install dependencies
4. ✅ Copy files to new project
5. ✅ Update imports (logo path, main.tsx, vite.config.ts)
6. ✅ Test with `npm run dev`
7. ✅ Build with `npm run build`
8. ✅ Deploy to Vercel/Netlify/GitHub Pages

Your app will be live and independent! 🚀
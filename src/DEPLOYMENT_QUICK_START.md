# ⚡ Deployment Quick Start

> **TL;DR version - for experienced developers who want the essentials**

**Full guide:** [COMPLETE_APP_DEPLOYMENT_GUIDE.md](./COMPLETE_APP_DEPLOYMENT_GUIDE.md)

---

## 🚀 **5-Step Deploy** (60 minutes)

```
1. Setup Local    →  2. Setup Supabase  →  3. Deploy Edge Fns  →  4. Deploy Frontend  →  5. Test
   (15 min)            (20 min)               (10 min)               (10 min)              (5 min)
```

---

## **Step 1: Local Setup** (15 min)

```bash
# Create Vite project
npm create vite@latest reactive-app -- --template react-ts
cd reactive-app

# Install dependencies
npm install lucide-react date-fns tailwindcss@4 @tailwindcss/vite \
  class-variance-authority clsx tailwind-merge \
  @radix-ui/react-accordion @radix-ui/react-alert-dialog \
  @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-label @radix-ui/react-popover \
  @radix-ui/react-select @radix-ui/react-tabs \
  @radix-ui/react-tooltip @radix-ui/react-slot \
  sonner@2.0.3 recharts @supabase/supabase-js

# Copy your files from Figma Make
# App.tsx → src/App.tsx
# components/ → src/components/
# styles/ → src/styles/
# utils/ → src/utils/
# supabase/ → src/supabase/
```

**Update files:**

`src/main.tsx`:
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

`vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

---

## **Step 2: Supabase Setup** (20 min)

### Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: `reactive-project-board`
3. Choose password & region
4. Wait 2-3 min

### Get Credentials
**Settings → API**, copy:
- Project URL: `https://xxxxx.supabase.co`
- Project ID: `xxxxx`
- anon key: `eyJhbG...`
- service_role key: `eyJhbG...`

### Update Frontend
`src/utils/supabase/info.tsx`:
```typescript
export const projectId = 'YOUR_PROJECT_ID';
export const publicAnonKey = 'YOUR_ANON_KEY';
```

---

## **Step 3: Deploy Edge Functions** (10 min)

```bash
# Install Supabase CLI
brew install supabase/tap/supabase  # Mac
# OR scoop install supabase  # Windows

# Login & link
supabase login
supabase link --project-ref YOUR_PROJECT_ID

# Set secrets
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
supabase secrets set SUPABASE_ANON_KEY=eyJhbG...
supabase secrets set SUPABASE_DB_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
supabase secrets set RESEND_API_KEY=re_xxxxx  # Get from resend.com

# Deploy
supabase functions deploy server
```

---

## **Step 4: Deploy Frontend** (10 min)

### Option A: Vercel (Recommended)

```bash
npm install -g vercel
npm run build
vercel --prod
```

### Option B: Netlify

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
# Choose dist/ as publish directory
```

### Option C: GitHub Pages

```bash
# Push to GitHub first
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USER/REPO.git
git push -u origin main

# Install & deploy
npm install --save-dev gh-pages

# Add to package.json:
# "homepage": "https://USER.github.io/REPO",
# "scripts": { "deploy": "gh-pages -d dist" }

npm run deploy
```

---

## **Step 5: Test** (5 min)

1. Open your deployed URL
2. Sign up (use email from Resend account)
3. Check email for verification code
4. Login & test features
5. ✅ **DONE!**

---

## 🎯 **Quick Checklist**

- [ ] Local: `npm run dev` works
- [ ] Supabase: Project created, credentials saved
- [ ] Supabase: `info.tsx` updated with project ID & anon key
- [ ] Resend: Account created, API key obtained
- [ ] Edge Functions: Deployed (`supabase functions deploy server`)
- [ ] Edge Functions: All 5 secrets set
- [ ] Frontend: Built (`npm run build`)
- [ ] Frontend: Deployed to Vercel/Netlify/GH Pages
- [ ] Testing: Can sign up & login
- [ ] Testing: Data persists after refresh

---

## 🆘 **Quick Troubleshooting**

| Problem | Fix |
|---------|-----|
| Module not found | `rm -rf node_modules && npm install` |
| Edge function error | `supabase functions logs server` |
| Auth not working | Check `info.tsx` has correct keys |
| Email not sending | Check Resend API key: `supabase secrets list` |
| CORS error | Add your domain to edge function CORS config |
| Data not saving | Check browser console, verify edge function deployed |

---

## 📊 **What You Get**

```
Your App = Frontend + Backend + Email

Frontend (Vercel/Netlify)
  ↓ calls API
Edge Functions (Supabase)
  ↓ stores in
Database (PostgreSQL)
  + Auth (Supabase)
  + Email (Resend)
```

---

## 🎓 **Environment Variables Summary**

### Frontend (in code)
```typescript
// src/utils/supabase/info.tsx
projectId = 'xxxxx'
publicAnonKey = 'eyJhbG...'  // Safe to expose
```

### Backend (Supabase secrets)
```bash
SUPABASE_URL              # https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY # Never expose to frontend!
SUPABASE_ANON_KEY         # Same as frontend publicAnonKey
SUPABASE_DB_URL           # Database connection string
RESEND_API_KEY            # Email service key
```

---

## 📚 **Important Links**

- **Full Guide:** [COMPLETE_APP_DEPLOYMENT_GUIDE.md](./COMPLETE_APP_DEPLOYMENT_GUIDE.md)
- **Architecture:** [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)
- **Team Access:** [ENABLE_TEAM_ACCESS.md](./ENABLE_TEAM_ACCESS.md)
- **Troubleshooting:** [docs/troubleshooting/](./docs/troubleshooting/)

---

## 🔑 **Key Commands**

```bash
# Local development
npm run dev              # Start dev server
npm run build            # Build for production

# Supabase
supabase login                          # Login to Supabase
supabase link --project-ref ID          # Link project
supabase secrets set KEY=value          # Set environment variable
supabase secrets list                   # View secrets
supabase functions deploy server        # Deploy edge function
supabase functions logs server          # View logs

# Vercel
vercel                   # Deploy preview
vercel --prod            # Deploy production

# Netlify
netlify deploy           # Deploy preview
netlify deploy --prod    # Deploy production

# GitHub Pages
npm run deploy           # Deploy to GH Pages
```

---

## ⏱️ **Time Breakdown**

| Task | Time |
|------|------|
| Setup local environment | 15 min |
| Create Supabase project | 5 min |
| Configure Supabase | 10 min |
| Setup Resend | 5 min |
| Deploy edge functions | 10 min |
| Deploy frontend | 10 min |
| Test & verify | 5 min |
| **TOTAL** | **60 min** |

Optional:
| Enable team access (domain verification) | +20 min |

---

## 💰 **Cost**

- ✅ **Supabase Free Tier:** 500MB database, 2GB bandwidth
- ✅ **Resend Free Tier:** 3,000 emails/month
- ✅ **Vercel Free Tier:** Unlimited deployments
- ✅ **Netlify Free Tier:** 100GB bandwidth
- ✅ **GitHub Pages:** Free for public repos

**Total: $0/month** for small teams!

---

**Need more details?** → [COMPLETE_APP_DEPLOYMENT_GUIDE.md](./COMPLETE_APP_DEPLOYMENT_GUIDE.md)

**Ready to deploy?** Start with Step 1! 🚀

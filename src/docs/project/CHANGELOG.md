# Changelog

All notable changes to the Reactive Technologies Product-Project Management Board.

## [2.0.0] - 2025-10-28

### 🎉 Major Release - Cloud & Team Collaboration

#### ✅ Authentication & Cloud Database
- **Secure user authentication** with email/password
- **Supabase cloud storage** - all data synced to cloud
- **Real-time team collaboration** - shared database across all users
- **Email domain restrictions** - only @reactive-technologies.com emails
- **Session persistence** - stay logged in across browser restarts
- **Automatic data migration** - localStorage moved to cloud on first login

#### ✅ Admin Control Panel
- **User management** - view all registered users
- **Delete users** - remove team members
- **Admin roles** - grant/revoke admin privileges
- **User details** - see join date, last login, email
- **Refresh functionality** - reload user list on demand
- **Self-protection** - cannot delete your own account

#### ✅ Account Management
- **Account settings dialog** - manage profile and security
- **Change password** - update with current password verification
- **Change email** - admin-only email updates
- **Profile updates** - edit display name
- **Account deletion** - self-service account removal
- **User attribution** - all changes tracked with names

#### ✅ Enhanced Documentation
- Complete documentation restructure
- Comprehensive guides for users and admins
- Technical documentation for developers
- Quick start guide for new users
- Troubleshooting guides

### 🔧 Enhanced Features

#### API Server
- **Hono web server** on Supabase Edge Functions
- **Protected routes** with Bearer token authentication
- **Admin-only endpoints** with role verification
- **Error handling** and detailed logging
- **CORS support** for cross-origin requests

#### Security
- **Email domain validation** (frontend + backend)
- **Password hashing** with bcrypt
- **Server-side admin verification** on all admin routes
- **Access token management** in localStorage
- **Protected API endpoints** require authentication

#### Data Management
- **Cloud KV store** for all data
- **Server-side CRUD operations** for projects, features, categories
- **Audit log** stored in cloud
- **Export/Import** still functional with cloud data
- **Automatic sync** across all users

### 📁 New Files Created

**Components:**
1. `/components/AccountSettingsDialog.tsx` - Account management UI
2. `/components/AdminPanel.tsx` - Admin control panel
3. `/components/AuthDialog.tsx` - Signup/login UI

**Server:**
1. `/supabase/functions/server/index.tsx` - API server
2. `/supabase/functions/server/kv_store.tsx` - Database utilities

**Utils:**
1. `/utils/supabase/client.ts` - Singleton Supabase client
2. `/utils/supabase/info.tsx` - Project configuration
3. `/utils/api.ts` - API helper functions

**Documentation:**
- `/docs/README.md` - Documentation index
- `/docs/getting-started/` - Quick start and authentication guides
- `/docs/user-guides/` - Features, export/import, audit log, account settings
- `/docs/admin-guides/` - Admin panel, email restrictions, user management
- `/docs/project/` - Changelog and attributions
- `/docs/technical/` - Architecture, deployment, API reference

### 🎨 UI Improvements

- **Account button** in top-right with dropdown menu
- **Admin tab** for user management
- **Login/Signup dialog** with tabs
- **Account settings modal** with profile and security sections
- **Confirmation dialogs** for destructive actions
- **Toast notifications** for all account actions
- **Loading states** during API calls

### 🐛 Bug Fixes

- Fixed multiple Supabase client instance warnings
- Proper error handling for API failures
- Session restoration on page reload
- Prevented self-deletion in admin panel
- Email domain validation edge cases

### ⚡ Performance

- Singleton Supabase client for better performance
- Lazy loading of user data
- Optimized API calls with proper caching
- Reduced unnecessary re-renders

---

## [1.0.0] - 2025-10-28 (Previous Release)

### 🎉 Initial Full Feature Release

#### Data Persistence
- Automatic localStorage saving for all data
- Data persists across browser sessions
- No manual save required

#### Search & Filter System
- Real-time search across projects
- Status filtering (Planning, In Progress, Deployed, Completed)
- Combined search + filter functionality
- Live result count display

#### Export/Import Functionality
- Export to JSON with complete backup
- Import from JSON to restore data
- Includes projects, features, categories, audit log
- Automatic filename with date stamp

#### Toast Notifications
- Success notifications for all CRUD operations
- Error notifications for failures
- Auto-dismiss and manual dismiss options

#### Audit Log System
- Complete activity tracking
- User attribution for all actions
- Timestamp for every change
- Color-coded action badges

#### User Identity
- User identification dialog on first launch
- Username stored in localStorage
- Required for audit trail attribution

---

## [0.9.0] - Prior to 2025-10-28

### Initial Features

- Main dashboard with project cards
- Timeline view (Gantt-style)
- Features matrix
- Full CRUD for projects and features
- Category management
- Category reordering with arrow buttons
- Reactive Technologies branding
- Purple gradient styling
- Figma design import
- Multiple view tabs

---

## Migration Guide

### From 1.0 to 2.0

**For Existing Users:**

1. **First Login** triggers automatic migration
   - localStorage data moves to cloud
   - Creates your user account
   - Preserves all projects and features

2. **Team Setup**
   - Share app URL with team members
   - Each person signs up with @reactive-technologies.com email
   - Everyone sees the same data

3. **Admin Setup**
   - First user automatically becomes admin
   - Grant admin role to other managers
   - Use Admin Panel for user management

### Fresh Install (2.0)

1. Sign up with @reactive-technologies.com email
2. Start creating projects and features
3. Everything saves automatically to cloud
4. Invite team members to collaborate

---

## Breaking Changes

### [2.0.0]

- **Authentication Required:** All users must sign up/login
- **Email Restrictions:** Only @reactive-technologies.com emails allowed
- **localStorage → Cloud:** Data moved from browser to cloud database
- **User Attribution:** All changes now tracked with user email/name
- **Admin Access:** Some features restricted to admin users

---

## Known Issues

### [2.0.0]

- Manual page refresh needed to see other users' changes
- No real-time sync (planned for future)
- Email verification not enforced (auto-confirmed)
- Cannot undo admin deletions

---

## Upcoming Features

### Planned Enhancements

- Real-time collaboration without refresh
- Email verification workflow
- Advanced filtering by date, user, feature
- Bulk operations (multi-select, bulk delete)
- Undo/redo functionality
- Export to CSV/Excel
- Mobile app
- Notification system
- Dark mode
- Keyboard shortcuts (Cmd+K search)

---

## Credits

- **UI Framework:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth, Database, Edge Functions)
- **Components:** shadcn/ui
- **Icons:** Lucide React
- **Charts:** Recharts
- **Notifications:** Sonner
- **Server:** Hono (Deno runtime)
- **Design:** Reactive Technologies branding
- **Build Tool:** Vite

---

## License

Proprietary - Reactive Technologies

---

## Support

For more information:
- [Documentation Index](../README.md)
- [Quick Start Guide](../getting-started/QUICK_START.md)
- [Admin Guide](../admin-guides/ADMIN_PANEL.md)
- [Features Overview](../user-guides/FEATURES.md)

---

**Last Updated:** October 28, 2025  
**Current Version:** 2.0.0  
**Organization:** Reactive Technologies

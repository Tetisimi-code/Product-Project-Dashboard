import { useState, useEffect, useMemo } from 'react';
import { ProductProjectBoard } from './components/ProductProjectBoard';
import { TimelineView } from './components/TimelineView';
import { FeaturesMatrix } from './components/FeaturesMatrix';
import { AuditLog, AuditEntry } from './components/AuditLog';
import { AuthDialog } from './components/AuthDialog';
import { AdminPanel } from './components/AdminPanel';
import { SearchFilter } from './components/SearchFilter';
import { AccountSettingsDialog } from './components/AccountSettingsDialog';
import { ResetPasswordDialog } from './components/ResetPasswordDialog';
import { AtlassianIntegrationDialog } from './components/AtlassianIntegrationDialog';
import { ConnectionDiagnostics } from './components/ConnectionDiagnostics';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { LoadingScreen } from './components/LoadingScreen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Plus, Settings, History, LogOut, Loader2, Shield, UserCircle, Trash2, Link2, Activity } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';
import { AddProjectDialog } from './components/AddProjectDialog';
import { ManageFeaturesDialog } from './components/ManageFeaturesDialog';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import logoImage from 'figma:asset/54d312aed3f16e91c436bfb4f646101be4eacef7.png';
import { supabase } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import * as api from './utils/api';

export interface ProductFeature {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface DeploymentNote {
  id: string;
  timestamp: Date;
  user: string;
  note: string;
  statusChange?: string;
}

export interface FeatureDeploymentInfo {
  featureId: string;
  status: 'not-started' | 'in-development' | 'in-testing' | 'staging' | 'deployed' | 'blocked' | 'rolled-back';
  assignedTo?: string;
  notes: DeploymentNote[];
  startedDate?: string;
  deployedDate?: string;
  lastUpdated: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in-progress' | 'deployed' | 'completed';
  startDate: string;
  endDate: string;
  progress: number;
  featuresUsed: string[]; // Feature IDs
  deployedFeatures: string[]; // Feature IDs that are already deployed
  description: string;
  featureDeployments?: Record<string, FeatureDeploymentInfo>; // keyed by featureId
  location?: string; // Optional: City, Country or Region
}

const mockProductFeatures: ProductFeature[] = [
  { id: 'f1', name: 'User Authentication', category: 'Security', description: 'SSO and multi-factor authentication' },
  { id: 'f2', name: 'Analytics Dashboard', category: 'Analytics', description: 'Real-time data visualization' },
  { id: 'f3', name: 'API Gateway', category: 'Infrastructure', description: 'RESTful API management' },
  { id: 'f4', name: 'Payment Processing', category: 'Commerce', description: 'Multiple payment providers integration' },
  { id: 'f5', name: 'Notification System', category: 'Communication', description: 'Email, SMS, and push notifications' },
  { id: 'f6', name: 'File Storage', category: 'Infrastructure', description: 'Cloud-based file management' },
  { id: 'f7', name: 'Reporting Engine', category: 'Analytics', description: 'Custom report generation' },
  { id: 'f8', name: 'User Management', category: 'Security', description: 'Role-based access control' },
];

const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'E-Commerce Platform Launch',
    status: 'in-progress',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    progress: 65,
    featuresUsed: ['f1', 'f3', 'f4', 'f5', 'f6', 'f8'],
    deployedFeatures: ['f1', 'f3', 'f8'],
    description: 'Building a comprehensive e-commerce platform for retail clients'
  },
  {
    id: 'p2',
    name: 'Internal Analytics Portal',
    status: 'deployed',
    startDate: '2024-02-01',
    endDate: '2024-04-15',
    progress: 100,
    featuresUsed: ['f1', 'f2', 'f7', 'f8'],
    deployedFeatures: ['f1', 'f2', 'f7', 'f8'],
    description: 'Analytics dashboard for internal business intelligence'
  },
  {
    id: 'p3',
    name: 'Mobile App Backend',
    status: 'in-progress',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    progress: 45,
    featuresUsed: ['f1', 'f3', 'f5', 'f6'],
    deployedFeatures: ['f1', 'f3'],
    description: 'API backend for mobile application with push notifications'
  },
  {
    id: 'p4',
    name: 'Customer Portal Redesign',
    status: 'planning',
    startDate: '2024-05-01',
    endDate: '2024-09-30',
    progress: 15,
    featuresUsed: ['f1', 'f2', 'f5', 'f8'],
    deployedFeatures: [],
    description: 'Modernizing customer-facing portal with enhanced analytics'
  },
  {
    id: 'p5',
    name: 'Payment Gateway Integration',
    status: 'in-progress',
    startDate: '2024-04-01',
    endDate: '2024-07-15',
    progress: 55,
    featuresUsed: ['f1', 'f3', 'f4', 'f8'],
    deployedFeatures: ['f1', 'f3'],
    description: 'Implementing multi-currency payment processing with fraud detection'
  },
  {
    id: 'p6',
    name: 'Enterprise Reporting System',
    status: 'completed',
    startDate: '2023-11-01',
    endDate: '2024-03-31',
    progress: 100,
    featuresUsed: ['f1', 'f2', 'f6', 'f7', 'f8'],
    deployedFeatures: ['f1', 'f2', 'f6', 'f7', 'f8'],
    description: 'Advanced reporting engine with custom templates and automated scheduling'
  },
  {
    id: 'p7',
    name: 'Real-Time Notification Hub',
    status: 'planning',
    startDate: '2024-06-01',
    endDate: '2024-10-31',
    progress: 5,
    featuresUsed: ['f1', 'f3', 'f5'],
    deployedFeatures: [],
    description: 'Building a centralized notification system supporting email, SMS, and push notifications'
  },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [minLoadingTimeElapsed, setMinLoadingTimeElapsed] = useState(false);
  
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [teamMembers, setTeamMembers] = useState<api.TeamMember[]>([]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFeaturesDialogOpen, setIsFeaturesDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isAtlassianDialogOpen, setIsAtlassianDialogOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [showMyProjects, setShowMyProjects] = useState(false);

  // Ensure loading screen displays for at least 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTimeElapsed(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Check for existing session on mount and set up auth state listener
  useEffect(() => {
    checkSession();
    checkForPasswordReset();

    // Set up auth state change listener for automatic token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'TOKEN_REFRESHED') {
        if (session) {
          console.log('Token refreshed, updating localStorage');
          localStorage.setItem('accessToken', session.access_token);
          // Just update the user state for token refresh - don't reload data
          setCurrentUser(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsAdmin(false);
      } else if (event === 'USER_UPDATED') {
        if (session) {
          setCurrentUser(session.user);
        }
      }
    });

    // Listen for auth errors from API calls
    const handleAuthError = async (event: any) => {
      console.error('Auth error from API:', event.detail);
      toast.error('Session expired', { description: 'Please log in again' });
      
      // Sign out and clear state
      await supabase.auth.signOut();
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
      setCurrentUser(null);
      setIsAdmin(false);
    };

    // Monitor network connection status
    const handleOnline = () => {
      toast.success('Back online', { 
        description: 'Your connection has been restored' 
      });
    };

    const handleOffline = () => {
      toast.error('No internet connection', { 
        description: 'Please check your network connection',
        duration: Infinity,
      });
    };

    window.addEventListener('auth-error', handleAuthError as EventListener);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('auth-error', handleAuthError as EventListener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Session exists - store the fresh access token
        localStorage.setItem('accessToken', session.access_token);
        await handleAuthSuccess(session.user, session.access_token);
      }
    } finally {
      // Always mark initialization as complete
      setIsInitializing(false);
    }
  };

  const checkForPasswordReset = () => {
    // Check if URL contains reset-password parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset-password') === 'true') {
      setIsResetPasswordDialogOpen(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleAuthSuccess = async (user: any, token: string) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('accessToken', token);
    setIsLoadingData(true);
    setIsInitializing(false); // Ensure we're no longer in initial state
    
    try {
      // Check admin status and load data in parallel
      await Promise.all([
        checkAdminStatus(),
        loadDataFromServer()
      ]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const checkAdminStatus = async () => {
    const result = await api.checkAdminStatus();
    if (result.data) {
      setIsAdmin(result.data.isAdmin);
    }
  };

  const loadTeamMembersWithRetry = async (retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const teamRes = await api.getTeamMembers();
        if (teamRes.data?.teamMembers) {
          setTeamMembers(teamRes.data.teamMembers);
          return true;
        }
      } catch (error) {
        console.log(`Team members load attempt ${i + 1} failed:`, error);
        if (i < retries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
      }
    }
    console.log('Failed to load team members after retries, using empty array');
    setTeamMembers([]);
    return false;
  };

  const loadDataFromServer = async () => {
    try {
      // Try to load data from server - use allSettled to handle individual failures gracefully
      // Load team members separately with retry logic to prevent it from blocking other data
      const [projectsRes, featuresRes, categoriesRes, auditRes] = await Promise.allSettled([
        api.getProjects(),
        api.getFeatures(),
        api.getCategories(),
        api.getAuditLog(),
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : { error: 'Failed to load' }));

      // Check if we got data from server
      const hasServerData = projectsRes.data?.projects && projectsRes.data.projects.length > 0;

      if (!hasServerData) {
        // No server data - check for localStorage data to migrate
        const localProjects = localStorage.getItem('projects');
        const localFeatures = localStorage.getItem('features');
        const localCategoryOrder = localStorage.getItem('categoryOrder');
        const localAuditLog = localStorage.getItem('auditLog');

        if (localProjects || localFeatures) {
          // Migrate localStorage data to server
          const migrationData = {
            projects: localProjects ? JSON.parse(localProjects) : mockProjects,
            features: localFeatures ? JSON.parse(localFeatures) : mockProductFeatures,
            categoryOrder: localCategoryOrder ? JSON.parse(localCategoryOrder) : 
              Array.from(new Set(mockProductFeatures.map(f => f.category))),
            auditLog: localAuditLog ? JSON.parse(localAuditLog) : [],
          };

          await api.initializeData(migrationData);
          
          setProjects(migrationData.projects);
          setFeatures(migrationData.features);
          setCategoryOrder(migrationData.categoryOrder);
          
          const withDates = migrationData.auditLog.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
          setAuditLog(withDates);

          toast.success('Data migrated to cloud', { 
            description: 'Your local data has been synced to the team database' 
          });
        } else {
          // No data anywhere - use mock data
          await api.initializeData({
            projects: mockProjects,
            features: mockProductFeatures,
            categoryOrder: Array.from(new Set(mockProductFeatures.map(f => f.category))),
            auditLog: [],
          });

          setProjects(mockProjects);
          setFeatures(mockProductFeatures);
          setCategoryOrder(Array.from(new Set(mockProductFeatures.map(f => f.category))));
          setAuditLog([]);
        }
      } else {
        // Use server data
        if (projectsRes.data) setProjects(projectsRes.data.projects);
        if (featuresRes.data) setFeatures(featuresRes.data.features);
        if (categoriesRes.data) setCategoryOrder(categoriesRes.data.categoryOrder);
        if (auditRes.data) {
          const withDates = auditRes.data.auditLog.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
          setAuditLog(withDates);
        }

        // Check if we need to add new dummy projects (p5, p6, p7)
        if (projectsRes.data?.projects) {
          const existingIds = projectsRes.data.projects.map((p: Project) => p.id);
          const newProjects = mockProjects.filter(p => ['p5', 'p6', 'p7'].includes(p.id) && !existingIds.includes(p.id));
          
          if (newProjects.length > 0) {
            // Add new projects to database
            for (const project of newProjects) {
              await api.createProject(project);
            }
            
            // Update local state
            setProjects([...projectsRes.data.projects, ...newProjects]);
            
            toast.success('New projects added', { 
              description: `Added ${newProjects.length} new dummy project${newProjects.length > 1 ? 's' : ''}` 
            });
          }
        }
      }
      
      // Load team members separately with retry logic (don't block on this)
      loadTeamMembersWithRetry().catch(err => {
        console.error('Failed to load team members:', err);
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data', { description: 'Please try refreshing the page' });
      // Set empty team members on error
      setTeamMembers([]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('accessToken');
    setProjects([]);
    setFeatures([]);
    setCategoryOrder([]);
    setAuditLog([]);
    toast.success('Logged out successfully');
  };

  const handleDeleteAccount = async () => {
    try {
      // Get fresh token before delete
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || localStorage.getItem('accessToken') || '';
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbcbebd7/delete-my-account`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete account');
      }

      // Log out and clear everything
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setIsAdmin(false);
      localStorage.removeItem('accessToken');
      setProjects([]);
      setFeatures([]);
      setCategoryOrder([]);
      setAuditLog([]);
      
      toast.success('Account deleted successfully', { 
        description: 'Your account and all associated data have been removed' 
      });
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete account', { 
        description: error instanceof Error ? error.message : 'Please try again' 
      });
    }
  };

  // Function to add audit entry
  const addAuditEntry = async (
    action: AuditEntry['action'],
    entityType: AuditEntry['entityType'],
    entityName: string,
    details?: string
  ) => {
    const userName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User';
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      user: userName,
      action,
      entityType,
      entityName,
      details
    };
    
    setAuditLog(prev => [...prev, entry]);
    await api.createAuditEntry(entry);
  };

  const handleAddProject = async (project: Project) => {
    const result = await api.createProject(project);
    if (result.error) {
      toast.error('Failed to create project', { description: result.error });
      return;
    }
    
    setProjects([...projects, project]);
    await addAuditEntry('create', 'project', project.name, `Created with ${project.featuresUsed.length} features`);
    toast.success('Project created', { description: project.name });
  };

  const handleAddFeature = async (feature: ProductFeature) => {
    const result = await api.createFeature(feature);
    if (result.error) {
      toast.error('Failed to add feature', { description: result.error });
      return;
    }
    
    setFeatures([...features, feature]);
    
    // Add new category to order if it doesn't exist
    if (!categoryOrder.includes(feature.category)) {
      const newOrder = [...categoryOrder, feature.category];
      setCategoryOrder(newOrder);
      await api.updateCategories(newOrder);
    }
    
    await addAuditEntry('create', 'feature', feature.name, `Added to ${feature.category} category`);
    toast.success('Feature added', { description: feature.name });
  };

  const handleUpdateFeature = async (updatedFeature: ProductFeature) => {
    const result = await api.updateFeature(updatedFeature.id, updatedFeature);
    if (result.error) {
      toast.error('Failed to update feature', { description: result.error });
      return;
    }
    
    // Update features array
    setFeatures(features.map(f => f.id === updatedFeature.id ? updatedFeature : f));
    
    // Add new category to order if it doesn't exist
    if (!categoryOrder.includes(updatedFeature.category)) {
      const newOrder = [...categoryOrder, updatedFeature.category];
      setCategoryOrder(newOrder);
      await api.updateCategories(newOrder);
    }
    
    await addAuditEntry('update', 'feature', updatedFeature.name, `Updated in ${updatedFeature.category} category`);
    toast.success('Feature updated', { description: updatedFeature.name });
  };

  const handleDeleteFeature = async (featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    
    const result = await api.deleteFeature(featureId);
    if (result.error) {
      toast.error('Failed to delete feature', { description: result.error });
      return;
    }
    
    setFeatures(features.filter(f => f.id !== featureId));
    
    // Also remove from projects locally (server does this too)
    setProjects(projects.map(p => ({
      ...p,
      featuresUsed: p.featuresUsed.filter(id => id !== featureId),
      deployedFeatures: p.deployedFeatures.filter(id => id !== featureId),
    })));
    
    if (feature) {
      await addAuditEntry('delete', 'feature', feature.name, `Removed from ${feature.category} category`);
      toast.success('Feature deleted', { description: feature.name });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    
    const result = await api.deleteProject(projectId);
    if (result.error) {
      toast.error('Failed to delete project', { description: result.error });
      return;
    }
    
    setProjects(projects.filter(p => p.id !== projectId));
    
    if (project) {
      await addAuditEntry('delete', 'project', project.name);
      toast.success('Project deleted', { description: project.name });
    }
  };

  const handleReorderCategory = async (category: string, direction: 'up' | 'down') => {
    const currentIndex = categoryOrder.indexOf(category);
    if (currentIndex === -1) return;

    const newOrder = [...categoryOrder];
    
    if (direction === 'up' && currentIndex > 0) {
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = 
        [newOrder[currentIndex - 1], newOrder[currentIndex]];
    } else if (direction === 'down' && currentIndex < categoryOrder.length - 1) {
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = 
        [newOrder[currentIndex + 1], newOrder[currentIndex]];
    } else {
      return;
    }
    
    setCategoryOrder(newOrder);
    await api.updateCategories(newOrder);
    await addAuditEntry('reorder', 'category', category, `Moved ${direction}`);
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    const result = await api.updateProject(updatedProject.id, updatedProject);
    if (result.error) {
      toast.error('Failed to update project', { description: result.error });
      return;
    }
    
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    await addAuditEntry('update', 'project', updatedProject.name, `Updated project details`);
    toast.success('Project updated', { description: updatedProject.name });
  };

  // Helper function to match location to region
  const matchRegion = (location: string | undefined, region: string): boolean => {
    if (!location) return false;
    const loc = location.toLowerCase();
    
    switch (region) {
      case 'africa':
        return loc.includes('africa');
      
      case 'americas':
        return loc.includes('americas');
      
      case 'apac':
        return loc.includes('asia/pacific') || loc.includes('apac');
      
      case 'europe':
        return loc.includes('europe');
      
      case 'middle-east':
        return loc.includes('middle east');
      
      case 'uk-ireland':
        return loc.includes('uk/ireland');
      
      default:
        return false;
    }
  };

  // Helper function to check if project is assigned to current user
  const isProjectAssignedToMe = (project: Project): boolean => {
    if (!currentUser) return false;
    
    const userEmail = currentUser.email?.toLowerCase();
    const userName = currentUser.user_metadata?.name?.toLowerCase();
    
    // Check if user has any features assigned to them in this project
    if (project.featureDeployments) {
      for (const deployment of Object.values(project.featureDeployments)) {
        if (deployment.assignedTo) {
          const assignedTo = deployment.assignedTo.toLowerCase();
          if (assignedTo === userEmail || assignedTo === userName || 
              assignedTo.includes(userEmail || '') || assignedTo.includes(userName || '')) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // Filter projects based on search, status, region, and assignment
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = searchQuery === '' || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      const matchesRegion = regionFilter === 'all' || matchRegion(project.location, regionFilter);
      
      const matchesAssignment = !showMyProjects || isProjectAssignedToMe(project);
      
      return matchesSearch && matchesStatus && matchesRegion && matchesAssignment;
    });
  }, [projects, searchQuery, statusFilter, regionFilter, showMyProjects, currentUser]);

  // Show single loading state during initial auth check and data loading
  // Ensure loading screen shows for at least 4 seconds
  if (!minLoadingTimeElapsed || isInitializing || (isAuthenticated && isLoadingData)) {
    return (
      <ThemeProvider>
        <LoadingScreen />
        <Toaster position="top-right" />
      </ThemeProvider>
    );
  }

  // Show auth dialog if not authenticated (only after initialization check)
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <AuthDialog open={true} onAuthSuccess={handleAuthSuccess} />
        <Toaster position="top-right" />
      </ThemeProvider>
    );
  }

  const userName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User';

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 dark:bg-slate-800/50 dark:border-slate-700/50">
            <div className="max-w-[98%] mx-auto px-3 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={logoImage} alt="Reactive Technologies" className="h-12 w-12 rounded-lg" />
                  <div>
                    <h1 className="text-white mb-0 dark:text-slate-100">Reactive Technologies</h1>
                    <p className="text-indigo-200 dark:text-slate-400">Product-Project Management Board</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <div className="text-right mr-2">
                    <p className="text-white text-sm dark:text-slate-200">Welcome back,</p>
                    <p className="text-indigo-200 text-sm dark:text-slate-400">{userName}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="bg-white/10 text-white border-white/20 hover:bg-white/20 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-600"
                      >
                        <UserCircle className="size-4 mr-2" />
                        Account
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => setIsAccountSettingsOpen(true)}>
                        <Settings className="size-4 mr-2" />
                        Account Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsDiagnosticsOpen(true)}>
                        <Activity className="size-4 mr-2" />
                        Connection Diagnostics
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="size-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setIsDeleteAccountDialogOpen(true)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete My Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[98%] mx-auto p-3 md:p-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/90">Track product feature deployment across projects</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsAtlassianDialogOpen(true)} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                    <Link2 className="size-4 mr-2" />
                    Jira/Confluence
                  </Button>
                  <Button onClick={() => setIsFeaturesDialogOpen(true)} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                    <Settings className="size-4 mr-2" />
                    Manage Features
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="bg-white text-indigo-900 hover:bg-white/90">
                    <Plus className="size-4 mr-2" />
                    Add Project
                  </Button>
                </div>
              </div>
              
              <SearchFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                regionFilter={regionFilter}
                onRegionFilterChange={setRegionFilter}
                showMyProjects={showMyProjects}
                onShowMyProjectsChange={setShowMyProjects}
                resultCount={filteredProjects.length}
                totalCount={projects.length}
              />
            </div>

            <Tabs defaultValue="board" className="w-full">
              <TabsList className="bg-white/10 border border-white/20">
                <TabsTrigger value="board" className="data-[state=active]:bg-white data-[state=active]:text-indigo-900 text-white">Board View</TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:bg-white data-[state=active]:text-indigo-900 text-white">Timeline View</TabsTrigger>
                <TabsTrigger value="features" className="data-[state=active]:bg-white data-[state=active]:text-indigo-900 text-white">Features Matrix</TabsTrigger>
                <TabsTrigger value="audit" className="data-[state=active]:bg-white data-[state=active]:text-indigo-900 text-white">
                  <History className="size-4 mr-2" />
                  Activity Log
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="admin" className="data-[state=active]:bg-white data-[state=active]:text-indigo-900 text-white">
                    <Shield className="size-4 mr-2" />
                    Admin
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="board" className="mt-6">
                <ProductProjectBoard 
                  features={features} 
                  projects={filteredProjects}
                  categoryOrder={categoryOrder}
                  currentUser={currentUser}
                  teamMembers={teamMembers}
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={handleDeleteProject}
                  onReorderCategory={handleReorderCategory}
                  onOpenAtlassianSettings={() => setIsAtlassianDialogOpen(true)}
                />
              </TabsContent>

              <TabsContent value="timeline" className="mt-6">
                <TimelineView features={features} projects={projects} />
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <FeaturesMatrix features={features} projects={projects} />
              </TabsContent>

              <TabsContent value="audit" className="mt-6">
                <AuditLog entries={auditLog} />
              </TabsContent>

              {isAdmin && (
                <TabsContent value="admin" className="mt-6">
                  <AdminPanel currentUserId={currentUser?.id} />
                </TabsContent>
              )}
            </Tabs>

            <AddProjectDialog
              open={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              features={features}
              onAdd={handleAddProject}
            />

            <ManageFeaturesDialog
              open={isFeaturesDialogOpen}
              onOpenChange={setIsFeaturesDialogOpen}
              features={features}
              categoryOrder={categoryOrder}
              onAdd={handleAddFeature}
              onUpdate={handleUpdateFeature}
              onDelete={handleDeleteFeature}
              onUpdateCategoryOrder={async (newOrder: string[]) => {
                setCategoryOrder(newOrder);
                await api.updateCategories(newOrder);
              }}
            />

            <AccountSettingsDialog
              open={isAccountSettingsOpen}
              onOpenChange={setIsAccountSettingsOpen}
              currentUser={currentUser}
              onProfileUpdate={(updatedUser) => setCurrentUser(updatedUser)}
              isAdmin={isAdmin}
              onLogout={handleLogout}
            />

            <ResetPasswordDialog
              open={isResetPasswordDialogOpen}
              onOpenChange={setIsResetPasswordDialogOpen}
              onSuccess={() => {
                toast.success('Password updated successfully');
                setIsResetPasswordDialogOpen(false);
              }}
            />

            <AtlassianIntegrationDialog
              open={isAtlassianDialogOpen}
              onOpenChange={setIsAtlassianDialogOpen}
            />

            <ConnectionDiagnostics
              open={isDiagnosticsOpen}
              onOpenChange={setIsDiagnosticsOpen}
            />

            <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    <br /><br />
                    <strong>Important:</strong> This will only delete YOUR account. All projects, features, and data created by the team will remain accessible to other team members.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete My Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Toaster position="top-right" />
          </div>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
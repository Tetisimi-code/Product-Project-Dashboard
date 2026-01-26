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
  productId: string;
  name: string;
  description: string;
  displayOrder?: number | null;
}

export interface ProductCatalog {
  id: string;
  name: string;
  description: string;
  manualUrl?: string | null;
  displayOrder?: number | null;
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

const mockProducts: ProductCatalog[] = [
  {
    id: 'frequency_and_rocof',
    name: 'Frequency and ROCOF',
    description: 'Visualize frequency and ROCOF',
    manualUrl: 'https://cdjrrnbihbkzmmaccslj.supabase.co/storage/v1/object/public/product-manuals/frequency-and-rocof-manual.docx',
    displayOrder: 1,
  },
  {
    id: 'spot_inertia_event_analysis',
    name: 'Event analysis',
    description: 'Spot inertia with event analysis',
    manualUrl: 'https://cdjrrnbihbkzmmaccslj.supabase.co/storage/v1/object/public/product-manuals/event-analysis-manual.docx',
    displayOrder: 2,
  },
  {
    id: 'oscillations',
    name: 'Oscillations',
    description: 'Oscillation Events',
    manualUrl: 'https://cdjrrnbihbkzmmaccslj.supabase.co/storage/v1/object/public/product-manuals/oscillations-manual.docx',
    displayOrder: 3,
  },
  {
    id: 'measurement',
    name: 'Measurement',
    description: 'Cloud-based file management',
    manualUrl: 'https://cdjrrnbihbkzmmaccslj.supabase.co/storage/v1/object/public/product-manuals/measurement-manual.docx',
    displayOrder: 4,
  },
  {
    id: 'inertia_monitoring',
    name: 'Monitoring',
    description: 'Inertia monitoring',
    manualUrl: 'https://cdjrrnbihbkzmmaccslj.supabase.co/storage/v1/object/public/product-manuals/monitoring-manual.docx',
    displayOrder: 5,
  },
  {
    id: 'passive_system_strength',
    name: 'Passive System Strength',
    description: 'Passive events',
    manualUrl: 'https://cdjrrnbihbkzmmaccslj.supabase.co/storage/v1/object/public/product-manuals/passive-system-strength-manual.docx',
    displayOrder: 6,
  },
  {
    id: 'active_system_strength',
    name: 'Active System Strength',
    description: 'Active Events',
    manualUrl: 'https://cdjrrnbihbkzmmaccslj.supabase.co/storage/v1/object/public/product-manuals/active-system-strength-manual.docx',
    displayOrder: 7,
  },
  {
    id: 'voltage',
    name: 'voltage',
    description: 'Displays system voltage',
    manualUrl: 'https://cdjrrnbihbkzmmaccslj.supabase.co/storage/v1/object/public/product-manuals/voltage-manual.docx',
    displayOrder: 8,
  },
  {
    id: 'instantaneous_flicker_and_voltage',
    name: 'Instantaneous Flicker and Voltage',
    description: 'Instantaneous Flicker and Voltage',
    manualUrl: 'https://cdjrrnbihbkzmmaccslj.supabase.co/storage/v1/object/public/product-manuals/instantaneous-flicker-and-voltage-manual.docx',
    displayOrder: 9,
  },
];

const mockProductFeatures: ProductFeature[] = [
  {
    id: 'frequency_events',
    productId: 'frequency_and_rocof',
    name: 'Frequency Events',
    description: 'Detect and analyze frequency excursions.',
    displayOrder: 1,
  },
  {
    id: 'rocof_trends',
    productId: 'frequency_and_rocof',
    name: 'ROCOF Trends',
    description: 'Track ROCOF patterns over time.',
    displayOrder: 2,
  },
  {
    id: 'event_detection',
    productId: 'spot_inertia_event_analysis',
    name: 'Event Detection',
    description: 'Identify inertia events across assets.',
    displayOrder: 1,
  },
  {
    id: 'inertia_reports',
    productId: 'spot_inertia_event_analysis',
    name: 'Inertia Reports',
    description: 'Generate event-based inertia reports.',
    displayOrder: 2,
  },
  {
    id: 'multimode_analysis',
    productId: 'oscillations',
    name: 'Multimode Analysis',
    description: 'Separate and analyze multiple oscillation modes.',
    displayOrder: 1,
  },
  {
    id: 'oscillation_events',
    productId: 'oscillations',
    name: 'Oscillation Events',
    description: 'Track oscillation events and trends.',
    displayOrder: 2,
  },
  {
    id: 'file_management',
    productId: 'measurement',
    name: 'File Management',
    description: 'Manage and organize measurement files.',
    displayOrder: 1,
  },
  {
    id: 'data_ingest',
    productId: 'measurement',
    name: 'Data Ingest',
    description: 'Ingest files into the measurement pipeline.',
    displayOrder: 2,
  },
  {
    id: 'monitoring_dashboard',
    productId: 'inertia_monitoring',
    name: 'Monitoring Dashboard',
    description: 'Monitor inertia signals in real time.',
    displayOrder: 1,
  },
  {
    id: 'threshold_alerts',
    productId: 'inertia_monitoring',
    name: 'Threshold Alerts',
    description: 'Configure alerts for inertia thresholds.',
    displayOrder: 2,
  },
  {
    id: 'passive_events',
    productId: 'passive_system_strength',
    name: 'Passive Events',
    description: 'Analyze passive system strength events.',
    displayOrder: 1,
  },
  {
    id: 'strength_index',
    productId: 'passive_system_strength',
    name: 'Strength Index',
    description: 'Summarize passive strength indicators.',
    displayOrder: 2,
  },
  {
    id: 'active_events',
    productId: 'active_system_strength',
    name: 'Active Events',
    description: 'Simulate and review active events.',
    displayOrder: 1,
  },
  {
    id: 'stress_scenarios',
    productId: 'active_system_strength',
    name: 'Stress Scenarios',
    description: 'Model strength under stress scenarios.',
    displayOrder: 2,
  },
  {
    id: 'voltage_overview',
    productId: 'voltage',
    name: 'Voltage Overview',
    description: 'Review voltage behavior across assets.',
    displayOrder: 1,
  },
  {
    id: 'voltage_alerts',
    productId: 'voltage',
    name: 'Voltage Alerts',
    description: 'Configure alerts for voltage excursions.',
    displayOrder: 2,
  },
  {
    id: 'flicker_insights',
    productId: 'instantaneous_flicker_and_voltage',
    name: 'Flicker Insights',
    description: 'Analyze instantaneous flicker patterns.',
    displayOrder: 1,
  },
  {
    id: 'instant_voltage',
    productId: 'instantaneous_flicker_and_voltage',
    name: 'Instant Voltage',
    description: 'Monitor instantaneous voltage changes.',
    displayOrder: 2,
  },
];

const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'E-Commerce Platform Launch',
    status: 'in-progress',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    progress: 65,
    featuresUsed: ['frequency_events', 'file_management', 'active_events', 'voltage_overview'],
    deployedFeatures: ['frequency_events', 'file_management'],
    description: 'Building a comprehensive e-commerce platform for retail clients'
  },
  {
    id: 'p2',
    name: 'Internal Analytics Portal',
    status: 'deployed',
    startDate: '2024-02-01',
    endDate: '2024-04-15',
    progress: 100,
    featuresUsed: ['event_detection', 'oscillation_events', 'monitoring_dashboard'],
    deployedFeatures: ['event_detection', 'oscillation_events', 'monitoring_dashboard'],
    description: 'Analytics dashboard for internal business intelligence'
  },
  {
    id: 'p3',
    name: 'Mobile App Backend',
    status: 'in-progress',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    progress: 45,
    featuresUsed: ['rocof_trends', 'passive_events', 'stress_scenarios'],
    deployedFeatures: ['rocof_trends'],
    description: 'API backend for mobile application with push notifications'
  },
  {
    id: 'p4',
    name: 'Customer Portal Redesign',
    status: 'planning',
    startDate: '2024-05-01',
    endDate: '2024-09-30',
    progress: 15,
    featuresUsed: ['data_ingest', 'voltage_alerts', 'flicker_insights'],
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
    featuresUsed: ['inertia_reports', 'strength_index'],
    deployedFeatures: ['inertia_reports'],
    description: 'Implementing multi-currency payment processing with fraud detection'
  },
  {
    id: 'p6',
    name: 'Enterprise Reporting System',
    status: 'completed',
    startDate: '2023-11-01',
    endDate: '2024-03-31',
    progress: 100,
    featuresUsed: ['multimode_analysis', 'threshold_alerts', 'instant_voltage'],
    deployedFeatures: ['multimode_analysis', 'threshold_alerts'],
    description: 'Advanced reporting engine with custom templates and automated scheduling'
  },
  {
    id: 'p7',
    name: 'Real-Time Notification Hub',
    status: 'planning',
    startDate: '2024-06-01',
    endDate: '2024-10-31',
    progress: 5,
    featuresUsed: ['file_management', 'flicker_insights'],
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
  
  const [products, setProducts] = useState<ProductCatalog[]>([]);
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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

  const normalizeProjectFeatures = (projectsToNormalize: Project[], featureList: ProductFeature[], productList: ProductCatalog[]) => {
    const featureIds = new Set(featureList.map(feature => feature.id));
    const baseFeatureByProduct = new Map(productList.map(product => [product.id, `${product.id}_base`]));

    return projectsToNormalize.map(project => {
      const normalizeIds = (ids: string[]) => {
        const normalized = ids.map((id) => {
          const baseId = baseFeatureByProduct.get(id);
          if (baseId && featureIds.has(baseId)) {
            return baseId;
          }
          return id;
        });
        return Array.from(new Set(normalized));
      };

      return {
        ...project,
        featuresUsed: normalizeIds(project.featuresUsed),
        deployedFeatures: normalizeIds(project.deployedFeatures),
      };
    });
  };

  const loadDataFromServer = async () => {
    try {
      // Try to load data from server - use allSettled to handle individual failures gracefully
      // Load team members separately with retry logic to prevent it from blocking other data
      const [projectsRes, featuresRes, productsRes, auditRes] = await Promise.allSettled([
        api.getProjects(),
        api.getFeatures(),
        api.getProducts(),
        api.getAuditLog(),
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : { error: 'Failed to load' }));

      const fallbackProducts = productsRes.data?.products || mockProducts;
      const fallbackFeatures = featuresRes.data?.features || mockProductFeatures;
      setProducts(fallbackProducts);
      setFeatures(fallbackFeatures);

      // Check if we got data from server
      const hasServerData = projectsRes.data?.projects && projectsRes.data.projects.length > 0;

      if (!hasServerData) {
        // No server data - check for localStorage data to migrate
        const localProjects = localStorage.getItem('projects');
        const localAuditLog = localStorage.getItem('auditLog');

        if (localProjects) {
          // Migrate localStorage data to server
          const migrationData = {
            projects: localProjects ? JSON.parse(localProjects) : mockProjects,
            features: [],
            categoryOrder: [],
            auditLog: localAuditLog ? JSON.parse(localAuditLog) : [],
          };

          await api.initializeData(migrationData);
          
          const normalizedProjects = normalizeProjectFeatures(migrationData.projects, fallbackFeatures, fallbackProducts);
          setProjects(normalizedProjects);
          
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
            features: [],
            categoryOrder: [],
            auditLog: [],
          });

          const normalizedProjects = normalizeProjectFeatures(mockProjects, fallbackFeatures, fallbackProducts);
          setProjects(normalizedProjects);
          setAuditLog([]);
        }
      } else {
        // Use server data
        let normalizedProjects: Project[] = [];
        if (projectsRes.data) {
          normalizedProjects = normalizeProjectFeatures(projectsRes.data.projects, fallbackFeatures, fallbackProducts);
          setProjects(normalizedProjects);
        }
        if (productsRes.data) setProducts(productsRes.data.products);
        if (auditRes.data) {
          const withDates = auditRes.data.auditLog.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
          setAuditLog(withDates);
        }

        // Check if we need to add new dummy projects (p5, p6, p7)
        if (projectsRes.data?.projects) {
          const existingIds = normalizedProjects.map((p: Project) => p.id);
          const newProjects = mockProjects.filter(p => ['p5', 'p6', 'p7'].includes(p.id) && !existingIds.includes(p.id));
          
          if (newProjects.length > 0) {
            // Add new projects to database
            for (const project of newProjects) {
              await api.createProject(project);
            }
            
            // Update local state
            setProjects([...normalizedProjects, ...newProjects]);
            
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
    setProducts([]);
    setProjects([]);
    setFeatures([]);
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
      setProducts([]);
      setProjects([]);
      setFeatures([]);
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

  const handleAddProduct = async (product: ProductCatalog) => {
    const result = await api.createProduct(product);
    if (result.error) {
      toast.error('Failed to add product', { description: result.error });
      return;
    }

    const savedProduct = result.data?.product || product;
    setProducts([...products, savedProduct]);
    await addAuditEntry('create', 'feature', savedProduct.name, 'Added product catalog entry');
    toast.success('Product added', { description: savedProduct.name });
  };

  const handleUpdateProduct = async (updatedProduct: ProductCatalog) => {
    const result = await api.updateProduct(updatedProduct.id, updatedProduct);
    if (result.error) {
      toast.error('Failed to update product', { description: result.error });
      return;
    }

    const savedProduct = result.data?.product || updatedProduct;
    setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
    await addAuditEntry('update', 'feature', savedProduct.name, 'Updated product catalog entry');
    toast.success('Product updated', { description: savedProduct.name });
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    const featureIdsToRemove = features.filter(feature => feature.productId === productId).map(feature => feature.id);
    const result = await api.deleteProduct(productId);
    if (result.error) {
      toast.error('Failed to delete product', { description: result.error });
      return;
    }

    setProducts(products.filter(p => p.id !== productId));
    setFeatures(features.filter(f => f.productId !== productId));
    if (featureIdsToRemove.length > 0) {
      setProjects(projects.map(p => ({
        ...p,
        featuresUsed: p.featuresUsed.filter(id => !featureIdsToRemove.includes(id)),
        deployedFeatures: p.deployedFeatures.filter(id => !featureIdsToRemove.includes(id)),
      })));
    }
    if (product) {
      await addAuditEntry('delete', 'feature', product.name, 'Removed product catalog entry');
      toast.success('Product deleted', { description: product.name });
    }
  };

  const handleAddFeature = async (feature: ProductFeature) => {
    const result = await api.createFeature(feature);
    if (result.error) {
      toast.error('Failed to add feature', { description: result.error });
      return;
    }
    
    const savedFeature = result.data?.feature || feature;
    setFeatures([...features, savedFeature]);
    
    await addAuditEntry('create', 'feature', savedFeature.name, 'Added to product catalog');
    toast.success('Feature added', { description: savedFeature.name });
  };

  const handleUpdateFeature = async (updatedFeature: ProductFeature) => {
    const result = await api.updateFeature(updatedFeature.id, updatedFeature);
    if (result.error) {
      toast.error('Failed to update feature', { description: result.error });
      return;
    }
    
    // Update features array
    const savedFeature = result.data?.feature || updatedFeature;
    setFeatures(features.map(f => f.id === savedFeature.id ? savedFeature : f));
    
    await addAuditEntry('update', 'feature', savedFeature.name, 'Updated product catalog entry');
    toast.success('Feature updated', { description: savedFeature.name });
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
      await addAuditEntry('delete', 'feature', feature.name, 'Removed from product catalog');
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
                  products={products}
                  features={features} 
                  projects={filteredProjects}
                  currentUser={currentUser}
                  teamMembers={teamMembers}
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={handleDeleteProject}
                  onOpenAtlassianSettings={() => setIsAtlassianDialogOpen(true)}
                />
              </TabsContent>

              <TabsContent value="timeline" className="mt-6">
                <TimelineView features={features} projects={projects} />
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <FeaturesMatrix products={products} features={features} projects={projects} />
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
              products={products}
              onAdd={handleAddProject}
            />

            <ManageFeaturesDialog
              open={isFeaturesDialogOpen}
              onOpenChange={setIsFeaturesDialogOpen}
              products={products}
              features={features}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onAdd={handleAddFeature}
              onUpdate={handleUpdateFeature}
              onDelete={handleDeleteFeature}
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

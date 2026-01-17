import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ConnectionDiagnosticsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DiagnosticTest {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: string;
}

export function ConnectionDiagnostics({ open, onOpenChange }: ConnectionDiagnosticsProps) {
  const [tests, setTests] = useState<DiagnosticTest[]>([
    { name: 'Network Connection', status: 'pending' },
    { name: 'Supabase Reachability', status: 'pending' },
    { name: 'API Function Health', status: 'pending' },
    { name: 'Authentication', status: 'pending' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, updates: Partial<DiagnosticTest>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test));
  };

  const runDiagnostics = async () => {
    setIsRunning(true);

    // Test 1: Network Connection
    updateTest(0, { status: 'running' });
    const isOnline = navigator.onLine;
    if (isOnline) {
      updateTest(0, { 
        status: 'success', 
        message: 'Connected to the internet',
        details: `Browser reports online status: ${isOnline}`
      });
    } else {
      updateTest(0, { 
        status: 'error', 
        message: 'No internet connection detected',
        details: 'Please check your network connection and try again'
      });
      setIsRunning(false);
      return;
    }

    // Test 2: Supabase Reachability
    updateTest(1, { status: 'running' });
    try {
      const supabaseUrl = `https://${projectId}.supabase.co`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(supabaseUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      updateTest(1, { 
        status: 'success', 
        message: 'Supabase server is reachable',
        details: `Response status: ${response.status}`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateTest(1, { 
        status: 'error', 
        message: 'Cannot reach Supabase server',
        details: `Error: ${errorMessage}`
      });
    }

    // Test 3: API Function Health
    updateTest(2, { status: 'running' });
    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-bbcbebd7/health`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        updateTest(2, { 
          status: 'success', 
          message: 'API function is responding',
          details: `Health check passed: ${JSON.stringify(data)}`
        });
      } else {
        updateTest(2, { 
          status: 'error', 
          message: `API returned status ${response.status}`,
          details: `Response: ${response.statusText}`
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateTest(2, { 
        status: 'error', 
        message: 'API function not responding',
        details: `Error: ${errorMessage}. The edge function may need to be deployed.`
      });
    }

    // Test 4: Authentication
    updateTest(3, { status: 'running' });
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        updateTest(3, { 
          status: 'success', 
          message: 'Authentication token found',
          details: `Token present in localStorage`
        });
      } else {
        updateTest(3, { 
          status: 'error', 
          message: 'No authentication token',
          details: 'Please try logging out and logging back in'
        });
      }
    } catch (error) {
      updateTest(3, { 
        status: 'error', 
        message: 'Cannot access authentication',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="size-5 text-green-600" />;
      case 'error':
        return <XCircle className="size-5 text-red-600" />;
      case 'running':
        return <RefreshCw className="size-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="size-5 text-gray-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {navigator.onLine ? (
              <Wifi className="size-5 text-green-600" />
            ) : (
              <WifiOff className="size-5 text-red-600" />
            )}
            Connection Diagnostics
          </DialogTitle>
          <DialogDescription>
            Run diagnostics to troubleshoot connection issues
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Project ID:</strong> {projectId}
              <br />
              <strong>API URL:</strong> https://{projectId}.supabase.co/functions/v1/make-server-bbcbebd7
              <br />
              <strong>Browser:</strong> {navigator.userAgent.split(' ').slice(-1)[0]}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-4 bg-white dark:bg-slate-800"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getStatusIcon(test.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{test.name}</h4>
                      <span className="text-xs text-gray-500 uppercase">
                        {test.status}
                      </span>
                    </div>
                    {test.message && (
                      <p className={`text-sm ${
                        test.status === 'success' ? 'text-green-600' :
                        test.status === 'error' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {test.message}
                      </p>
                    )}
                    {test.details && (
                      <p className="text-xs text-gray-500 mt-1 font-mono break-all">
                        {test.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="size-4 mr-2 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                <>
                  <RefreshCw className="size-4 mr-2" />
                  Run Diagnostics
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setTests(tests.map(t => ({ ...t, status: 'pending', message: undefined, details: undefined })));
              }}
              disabled={isRunning}
            >
              Reset
            </Button>
          </div>

          {tests.some(t => t.status === 'error') && !isRunning && (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>
                <strong>Troubleshooting Tips:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Check your internet connection</li>
                  <li>Try disabling VPN or proxy if you're using one</li>
                  <li>Clear browser cache and cookies</li>
                  <li>Try a different browser or incognito mode</li>
                  <li>Check if your firewall is blocking the connection</li>
                  <li>Verify that the Supabase Edge Function is deployed</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

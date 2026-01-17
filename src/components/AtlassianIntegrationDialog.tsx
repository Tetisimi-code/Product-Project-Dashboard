import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle2, XCircle, ExternalLink, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as api from '../utils/api';

interface AtlassianIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AtlassianIntegrationDialog({ open, onOpenChange }: AtlassianIntegrationDialogProps) {
  const [jiraUrl, setJiraUrl] = useState('');
  const [jiraEmail, setJiraEmail] = useState('');
  const [jiraToken, setJiraToken] = useState('');
  const [confluenceUrl, setConfluenceUrl] = useState('');
  const [confluenceEmail, setConfluenceEmail] = useState('');
  const [confluenceToken, setConfluenceToken] = useState('');
  
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSavingJira, setIsSavingJira] = useState(false);
  const [isSavingConfluence, setIsSavingConfluence] = useState(false);
  const [isTestingJira, setIsTestingJira] = useState(false);
  const [isTestingConfluence, setIsTestingConfluence] = useState(false);
  
  const [jiraConnected, setJiraConnected] = useState(false);
  const [confluenceConnected, setConfluenceConnected] = useState(false);

  useEffect(() => {
    if (open) {
      loadConfiguration();
    }
  }, [open]);

  const loadConfiguration = async () => {
    setIsLoadingConfig(true);
    try {
      const result = await api.getAtlassianConfig();
      if (result.data) {
        if (result.data.jira) {
          setJiraUrl(result.data.jira.url || '');
          setJiraEmail(result.data.jira.email || '');
          setJiraConnected(result.data.jira.connected || false);
        }
        if (result.data.confluence) {
          setConfluenceUrl(result.data.confluence.url || '');
          setConfluenceEmail(result.data.confluence.email || '');
          setConfluenceConnected(result.data.confluence.connected || false);
        }
      }
    } catch (error) {
      console.error('Failed to load Atlassian config:', error);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleSaveJira = async () => {
    if (!jiraUrl || !jiraEmail || !jiraToken) {
      toast.error('Please fill in all Jira fields');
      return;
    }

    setIsSavingJira(true);
    try {
      const result = await api.saveJiraConfig({
        url: jiraUrl,
        email: jiraEmail,
        token: jiraToken,
      });

      if (result.error) {
        toast.error('Failed to save Jira configuration', { description: result.error });
      } else {
        toast.success('Jira configuration saved');
        setJiraConnected(true);
        setJiraToken(''); // Clear token from UI after saving
      }
    } catch (error) {
      toast.error('Failed to save Jira configuration');
    } finally {
      setIsSavingJira(false);
    }
  };

  const handleSaveConfluence = async () => {
    if (!confluenceUrl || !confluenceEmail || !confluenceToken) {
      toast.error('Please fill in all Confluence fields');
      return;
    }

    setIsSavingConfluence(true);
    try {
      const result = await api.saveConfluenceConfig({
        url: confluenceUrl,
        email: confluenceEmail,
        token: confluenceToken,
      });

      if (result.error) {
        toast.error('Failed to save Confluence configuration', { description: result.error });
      } else {
        toast.success('Confluence configuration saved');
        setConfluenceConnected(true);
        setConfluenceToken(''); // Clear token from UI after saving
      }
    } catch (error) {
      toast.error('Failed to save Confluence configuration');
    } finally {
      setIsSavingConfluence(false);
    }
  };

  const handleTestJira = async () => {
    setIsTestingJira(true);
    try {
      const result = await api.testJiraConnection();
      if (result.data?.success) {
        toast.success('Jira connection successful!', { 
          description: `Connected to ${result.data.siteName || 'Jira'}` 
        });
        setJiraConnected(true);
      } else {
        toast.error('Jira connection failed', { description: result.error || 'Please check your credentials' });
        setJiraConnected(false);
      }
    } catch (error) {
      toast.error('Failed to test Jira connection');
      setJiraConnected(false);
    } finally {
      setIsTestingJira(false);
    }
  };

  const handleTestConfluence = async () => {
    setIsTestingConfluence(true);
    try {
      const result = await api.testConfluenceConnection();
      if (result.data?.success) {
        toast.success('Confluence connection successful!', { 
          description: `Connected to ${result.data.siteName || 'Confluence'}` 
        });
        setConfluenceConnected(true);
      } else {
        toast.error('Confluence connection failed', { description: result.error || 'Please check your credentials' });
        setConfluenceConnected(false);
      }
    } catch (error) {
      toast.error('Failed to test Confluence connection');
      setConfluenceConnected(false);
    } finally {
      setIsTestingConfluence(false);
    }
  };

  const handleDisconnectJira = async () => {
    try {
      await api.disconnectJira();
      setJiraConnected(false);
      setJiraUrl('');
      setJiraEmail('');
      setJiraToken('');
      toast.success('Jira disconnected');
    } catch (error) {
      toast.error('Failed to disconnect Jira');
    }
  };

  const handleDisconnectConfluence = async () => {
    try {
      await api.disconnectConfluence();
      setConfluenceConnected(false);
      setConfluenceUrl('');
      setConfluenceEmail('');
      setConfluenceToken('');
      toast.success('Confluence disconnected');
    } catch (error) {
      toast.error('Failed to disconnect Confluence');
    }
  };

  if (isLoadingConfig) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Atlassian Integration</DialogTitle>
            <DialogDescription>
              Loading configuration...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Atlassian Integration</DialogTitle>
          <DialogDescription>
            Connect your Jira and Confluence accounts to sync projects, issues, and documentation
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="jira" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jira">
              Jira
              {jiraConnected && <CheckCircle2 className="ml-2 size-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="confluence">
              Confluence
              {confluenceConnected && <CheckCircle2 className="ml-2 size-4 text-green-600" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jira" className="space-y-4">
            <Alert>
              <Info className="size-4" />
              <AlertDescription>
                To get your Jira API token, visit{' '}
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Atlassian Account Settings
                  <ExternalLink className="size-3" />
                </a>
              </AlertDescription>
            </Alert>

            {jiraConnected && (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CheckCircle2 className="size-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Jira is connected and ready to use
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="jira-url">Jira Site URL</Label>
                <Input
                  id="jira-url"
                  placeholder="https://yourcompany.atlassian.net"
                  value={jiraUrl}
                  onChange={(e) => setJiraUrl(e.target.value)}
                  disabled={jiraConnected}
                />
              </div>

              <div>
                <Label htmlFor="jira-email">Email Address</Label>
                <Input
                  id="jira-email"
                  type="email"
                  placeholder="your-email@company.com"
                  value={jiraEmail}
                  onChange={(e) => setJiraEmail(e.target.value)}
                  disabled={jiraConnected}
                />
              </div>

              <div>
                <Label htmlFor="jira-token">API Token</Label>
                <Input
                  id="jira-token"
                  type="password"
                  placeholder="Enter your Jira API token"
                  value={jiraToken}
                  onChange={(e) => setJiraToken(e.target.value)}
                  disabled={jiraConnected}
                />
              </div>

              <div className="flex gap-2">
                {!jiraConnected ? (
                  <>
                    <Button 
                      onClick={handleSaveJira} 
                      disabled={isSavingJira || !jiraUrl || !jiraEmail || !jiraToken}
                    >
                      {isSavingJira && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Save & Connect
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleTestJira}
                      disabled={isTestingJira || !jiraUrl || !jiraEmail || !jiraToken}
                    >
                      {isTestingJira && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Test Connection
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleTestJira}
                      disabled={isTestingJira}
                    >
                      {isTestingJira && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Test Connection
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDisconnectJira}
                    >
                      Disconnect
                    </Button>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="confluence" className="space-y-4">
            <Alert>
              <Info className="size-4" />
              <AlertDescription>
                To get your Confluence API token, visit{' '}
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Atlassian Account Settings
                  <ExternalLink className="size-3" />
                </a>
              </AlertDescription>
            </Alert>

            {confluenceConnected && (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CheckCircle2 className="size-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Confluence is connected and ready to use
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="confluence-url">Confluence Site URL</Label>
                <Input
                  id="confluence-url"
                  placeholder="https://yourcompany.atlassian.net/wiki"
                  value={confluenceUrl}
                  onChange={(e) => setConfluenceUrl(e.target.value)}
                  disabled={confluenceConnected}
                />
              </div>

              <div>
                <Label htmlFor="confluence-email">Email Address</Label>
                <Input
                  id="confluence-email"
                  type="email"
                  placeholder="your-email@company.com"
                  value={confluenceEmail}
                  onChange={(e) => setConfluenceEmail(e.target.value)}
                  disabled={confluenceConnected}
                />
              </div>

              <div>
                <Label htmlFor="confluence-token">API Token</Label>
                <Input
                  id="confluence-token"
                  type="password"
                  placeholder="Enter your Confluence API token"
                  value={confluenceToken}
                  onChange={(e) => setConfluenceToken(e.target.value)}
                  disabled={confluenceConnected}
                />
              </div>

              <div className="flex gap-2">
                {!confluenceConnected ? (
                  <>
                    <Button 
                      onClick={handleSaveConfluence} 
                      disabled={isSavingConfluence || !confluenceUrl || !confluenceEmail || !confluenceToken}
                    >
                      {isSavingConfluence && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Save & Connect
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleTestConfluence}
                      disabled={isTestingConfluence || !confluenceUrl || !confluenceEmail || !confluenceToken}
                    >
                      {isTestingConfluence && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Test Connection
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleTestConfluence}
                      disabled={isTestingConfluence}
                    >
                      {isTestingConfluence && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Test Connection
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDisconnectConfluence}
                    >
                      Disconnect
                    </Button>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

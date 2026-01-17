import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, ExternalLink, Search, AlertCircle, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as api from '../utils/api';

interface JiraLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  currentJiraKey?: string;
  onLink: (jiraKey: string, jiraUrl: string) => void;
  onOpenSettings?: () => void;
}

export function JiraLinkDialog({ 
  open, 
  onOpenChange, 
  projectId, 
  projectName,
  currentJiraKey,
  onLink,
  onOpenSettings 
}: JiraLinkDialogProps) {
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [jiraProjects, setJiraProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [useCustomKey, setUseCustomKey] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isJiraConfigured, setIsJiraConfigured] = useState(true);

  useEffect(() => {
    if (open) {
      loadJiraProjects();
      if (currentJiraKey) {
        setCustomKey(currentJiraKey);
        setUseCustomKey(true);
      }
    }
  }, [open, currentJiraKey]);

  const loadJiraProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const result = await api.getJiraProjects();
      if (result.data?.projects) {
        setJiraProjects(result.data.projects);
        setIsJiraConfigured(true);
      } else if (result.error) {
        // Check if Jira is not configured
        if (result.error === 'Jira not configured') {
          setIsJiraConfigured(false);
        } else {
          toast.error('Failed to load Jira projects', { description: result.error });
        }
      }
    } catch (error) {
      console.error('Failed to load Jira projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleLink = async () => {
    const jiraKey = useCustomKey ? customKey : selectedProject;
    
    if (!jiraKey) {
      toast.error('Please select or enter a Jira project key');
      return;
    }

    setIsLinking(true);
    try {
      const result = await api.linkProjectToJira(projectId, jiraKey);
      if (result.error) {
        toast.error('Failed to link project', { description: result.error });
      } else {
        toast.success('Project linked to Jira', { description: `Linked to ${jiraKey}` });
        const jiraUrl = result.data?.jiraUrl || '';
        onLink(jiraKey, jiraUrl);
        onOpenChange(false);
      }
    } catch (error) {
      toast.error('Failed to link project');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link to Jira Project</DialogTitle>
          <DialogDescription>
            Link "{projectName}" to a Jira project to track issues and sync status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isJiraConfigured ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>
                <p className="mb-2">Jira is not configured. Please set up your Jira credentials first.</p>
                {onOpenSettings && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      onOpenSettings();
                    }}
                  >
                    <Settings className="size-4 mr-2" />
                    Open Jira Settings
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          ) : isLoadingProjects ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant={!useCustomKey ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUseCustomKey(false)}
                >
                  Select Project
                </Button>
                <Button
                  variant={useCustomKey ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUseCustomKey(true)}
                >
                  Enter Key Manually
                </Button>
              </div>

              {!useCustomKey ? (
                <div>
                  <Label htmlFor="jira-project">Select Jira Project</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger id="jira-project">
                      <SelectValue placeholder="Choose a Jira project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jiraProjects.length === 0 ? (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                          No Jira projects found
                        </div>
                      ) : (
                        jiraProjects.map((project) => (
                          <SelectItem key={project.key} value={project.key}>
                            {project.key} - {project.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label htmlFor="custom-key">Jira Project Key</Label>
                  <Input
                    id="custom-key"
                    placeholder="e.g., PROJ or PROJECT-123"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value.toUpperCase())}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter the Jira project key (e.g., PROJ, DEV, TEAM)
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {isJiraConfigured && (
            <Button 
              onClick={handleLink} 
              disabled={isLinking || (!selectedProject && !customKey)}
            >
              {isLinking && <Loader2 className="mr-2 size-4 animate-spin" />}
              Link Project
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

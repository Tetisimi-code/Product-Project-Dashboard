import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { ProductFeature, FeatureDeploymentInfo, DeploymentNote, Project } from '../App';
import { Calendar, User, Clock, CheckCircle2, AlertCircle, Code, TestTube, Rocket, Ban, Undo } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { TeamMember } from '../utils/api';

interface FeatureDeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: ProductFeature;
  project: Project;
  currentUser: any;
  teamMembers: TeamMember[];
  onUpdate: (project: Project) => void;
}

const deploymentStatuses = [
  { value: 'not-started', label: 'Not Started', icon: Clock, color: 'bg-slate-500' },
  { value: 'in-development', label: 'In Development', icon: Code, color: 'bg-blue-500' },
  { value: 'in-testing', label: 'In Testing', icon: TestTube, color: 'bg-yellow-500' },
  { value: 'staging', label: 'Staging', icon: Rocket, color: 'bg-purple-500' },
  { value: 'deployed', label: 'Deployed', icon: CheckCircle2, color: 'bg-green-500' },
  { value: 'blocked', label: 'Blocked', icon: Ban, color: 'bg-red-500' },
  { value: 'rolled-back', label: 'Rolled Back', icon: Undo, color: 'bg-orange-500' },
] as const;

export function FeatureDeploymentDialog({ 
  open, 
  onOpenChange, 
  feature, 
  project, 
  currentUser,
  teamMembers,
  onUpdate 
}: FeatureDeploymentDialogProps) {
  const [noteText, setNoteText] = useState('');
  const [assignee, setAssignee] = useState('');

  // Get or initialize deployment info for this feature
  const getDeploymentInfo = (): FeatureDeploymentInfo => {
    const existing = project.featureDeployments?.[feature.id];
    if (existing) {
      // Convert note timestamps to Date objects if they're strings
      return {
        ...existing,
        notes: existing.notes.map(note => ({
          ...note,
          timestamp: note.timestamp instanceof Date ? note.timestamp : new Date(note.timestamp)
        }))
      };
    }
    
    // Initialize new deployment info
    const isDeployed = project.deployedFeatures.includes(feature.id);
    return {
      featureId: feature.id,
      status: isDeployed ? 'deployed' : 'not-started',
      notes: [],
      lastUpdated: new Date().toISOString(),
    };
  };

  const deploymentInfo = getDeploymentInfo();

  const handleStatusChange = (newStatus: FeatureDeploymentInfo['status']) => {
    const userName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User';
    const oldStatus = deploymentInfo.status;
    
    const statusNote: DeploymentNote = {
      id: `note-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      user: userName,
      note: `Status changed from ${oldStatus} to ${newStatus}`,
      statusChange: `${oldStatus} → ${newStatus}`,
    };

    const updatedInfo: FeatureDeploymentInfo = {
      ...deploymentInfo,
      status: newStatus,
      notes: [...deploymentInfo.notes, statusNote],
      lastUpdated: new Date().toISOString(),
      startedDate: !deploymentInfo.startedDate && newStatus !== 'not-started' 
        ? new Date().toISOString() 
        : deploymentInfo.startedDate,
      deployedDate: newStatus === 'deployed' 
        ? new Date().toISOString() 
        : deploymentInfo.deployedDate,
    };

    // Update deployedFeatures array based on status
    const updatedDeployedFeatures = newStatus === 'deployed'
      ? [...new Set([...project.deployedFeatures, feature.id])]
      : project.deployedFeatures.filter(id => id !== feature.id);

    const updatedProject: Project = {
      ...project,
      deployedFeatures: updatedDeployedFeatures,
      featureDeployments: {
        ...project.featureDeployments,
        [feature.id]: updatedInfo,
      },
    };

    onUpdate(updatedProject);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;

    const userName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User';
    
    const newNote: DeploymentNote = {
      id: `note-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      user: userName,
      note: noteText.trim(),
    };

    const updatedInfo: FeatureDeploymentInfo = {
      ...deploymentInfo,
      notes: [...deploymentInfo.notes, newNote],
      lastUpdated: new Date().toISOString(),
    };

    const updatedProject: Project = {
      ...project,
      featureDeployments: {
        ...project.featureDeployments,
        [feature.id]: updatedInfo,
      },
    };

    onUpdate(updatedProject);
    setNoteText('');
  };

  const handleAssigneeChange = (newAssignee: string) => {
    const updatedInfo: FeatureDeploymentInfo = {
      ...deploymentInfo,
      assignedTo: newAssignee || undefined,
      lastUpdated: new Date().toISOString(),
    };

    const updatedProject: Project = {
      ...project,
      featureDeployments: {
        ...project.featureDeployments,
        [feature.id]: updatedInfo,
      },
    };

    onUpdate(updatedProject);
    setAssignee('');
  };

  const currentStatusConfig = deploymentStatuses.find(s => s.value === deploymentInfo.status) || deploymentStatuses[0];
  const StatusIcon = currentStatusConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`size-10 rounded-lg ${currentStatusConfig.color} flex items-center justify-center`}>
              <StatusIcon className="size-6 text-white" />
            </div>
            <div>
              <div>{feature.name}</div>
              <p className="text-slate-600 text-sm mt-1">in {project.name}</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Track deployment progress, add notes, and manage status for this feature.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          {/* Status and Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deployment Status</Label>
              <Select 
                value={deploymentInfo.status} 
                onValueChange={(value) => handleStatusChange(value as FeatureDeploymentInfo['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deploymentStatuses.map((status) => {
                    const Icon = status.icon;
                    return (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <div className={`size-2 rounded-full ${status.color}`} />
                          {status.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select 
                value={deploymentInfo.assignedTo || 'none'} 
                onValueChange={(value) => handleAssigneeChange(value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      <div className="flex items-center gap-2">
                        <User className="size-3" />
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2">
            {deploymentInfo.startedDate && (
              <Badge variant="outline" className="gap-2">
                <Calendar className="size-3" />
                Started: {new Date(deploymentInfo.startedDate).toLocaleDateString()}
              </Badge>
            )}
            {deploymentInfo.deployedDate && (
              <Badge variant="outline" className="gap-2">
                <CheckCircle2 className="size-3" />
                Deployed: {new Date(deploymentInfo.deployedDate).toLocaleDateString()}
              </Badge>
            )}
            {deploymentInfo.assignedTo && (
              <Badge variant="outline" className="gap-2">
                <User className="size-3" />
                {deploymentInfo.assignedTo}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Add Note Section */}
          <div className="space-y-3">
            <Label>Add Note</Label>
            <Textarea
              placeholder="Add updates, blockers, or any relevant information..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleAddNote} 
              disabled={!noteText.trim()}
              className="w-full"
            >
              Add Note
            </Button>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="text-slate-900 mb-3">Activity Timeline</h3>
            <ScrollArea className="flex-1">
              {deploymentInfo.notes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No activity yet. Add a note or change the status to start tracking.
                </div>
              ) : (
                <div className="space-y-4 pr-4">
                  {[...deploymentInfo.notes].reverse().map((note) => (
                    <div key={note.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="size-8 rounded-full bg-purple-100 flex items-center justify-center">
                          {note.statusChange ? (
                            <AlertCircle className="size-4 text-purple-600" />
                          ) : (
                            <User className="size-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 w-px bg-slate-200 mt-2" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-900">{note.user}</span>
                          <span className="text-slate-500 text-sm">
                            {formatDistance(note.timestamp, new Date(), { addSuffix: true })}
                          </span>
                        </div>
                        {note.statusChange && (
                          <Badge variant="secondary" className="mb-2 text-xs">
                            Status: {note.statusChange}
                          </Badge>
                        )}
                        <p className="text-slate-600">{note.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
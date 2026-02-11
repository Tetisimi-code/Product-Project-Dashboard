import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { ProductFeature, FeatureDeploymentInfo, DeploymentNote, Project, AssignedUser } from '../App';
import { Calendar, User, Clock, CheckCircle2, AlertCircle, Code, TestTube, Rocket, Ban, Undo, UserPlus, UserMinus, X } from 'lucide-react';
import { formatDistance } from 'date-fns';
import * as api from '../utils/api';

interface FeatureDeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: ProductFeature;
  project: Project;
  currentUser: any;
  isAdmin: boolean;
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
  isAdmin,
  onUpdate 
}: FeatureDeploymentDialogProps) {
  const [noteText, setNoteText] = useState('');
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);

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
  const assignedUsers: AssignedUser[] = deploymentInfo.assignedUsers
    ?? (deploymentInfo.assignedTo ? [{ name: deploymentInfo.assignedTo }] : []);
  const currentUserId = currentUser?.id;
  const currentUserEmail = currentUser?.email;
  const currentUserName = currentUser?.user_metadata?.name || currentUserEmail?.split('@')[0] || 'User';
  const currentAssignee: AssignedUser | null = currentUser
    ? { id: currentUserId, name: currentUserName, email: currentUserEmail }
    : null;
  const isCurrentUserAssigned = currentAssignee
    ? assignedUsers.some(assignee =>
        (assignee.id && currentAssignee.id && assignee.id === currentAssignee.id) ||
        (assignee.email && currentAssignee.email && assignee.email === currentAssignee.email) ||
        assignee.name === currentAssignee.name
      )
    : false;

  const isSameAssignee = (assignee: AssignedUser, target: AssignedUser | null) => {
    if (!target) return false;
    return (
      (assignee.id && target.id && assignee.id === target.id) ||
      (assignee.email && target.email && assignee.email === target.email) ||
      assignee.name === target.name
    );
  };

  useEffect(() => {
    if (!open) return;
    api.getUsers().then(result => {
      if (result.data?.users) {
        setUsers(result.data.users);
      }
    });
  }, [open]);

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
    const normalizedExisting = new Set(assignedUsers.map(assignee => assignee.name.toLowerCase()));
    const normalizedText = noteText.toLowerCase();
    const newMentions = users
      .filter(user => normalizedText.includes(`@${user.name.toLowerCase()}`))
      .filter(user => !normalizedExisting.has(user.name.toLowerCase()))
      .map(user => ({ id: user.id, name: user.name, email: user.email }));
    
    const newNote: DeploymentNote = {
      id: `note-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      user: userName,
      note: noteText.trim(),
    };

    const updatedInfo: FeatureDeploymentInfo = {
      ...deploymentInfo,
      notes: [...deploymentInfo.notes, newNote],
      assignedUsers: [...assignedUsers, ...newMentions],
      assignedTo: undefined,
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

  const handleNoteChange = (value: string) => {
    setNoteText(value);
    const cursorIndex = value.length;
    const slice = value.slice(0, cursorIndex);
    const atIndex = slice.lastIndexOf('@');
    if (atIndex === -1) {
      setMentionOpen(false);
      setMentionQuery('');
      return;
    }
    const query = slice.slice(atIndex + 1);
    if (query.includes(' ') || query.includes('\n')) {
      setMentionOpen(false);
      setMentionQuery('');
      return;
    }
    setMentionQuery(query);
    setMentionOpen(true);
  };

  const filteredUsers = useMemo(() => {
    if (!mentionOpen) return [];
    const query = mentionQuery.trim().toLowerCase();
    if (!query) return users.slice(0, 6);
    return users
      .filter(user => user.name.toLowerCase().startsWith(query))
      .slice(0, 6);
  }, [mentionOpen, mentionQuery, users]);

  const insertMention = (user: AssignedUser) => {
    const cursorIndex = noteText.length;
    const before = noteText.slice(0, cursorIndex);
    const atIndex = before.lastIndexOf('@');
    if (atIndex === -1) return;
    const after = noteText.slice(cursorIndex);
    const nextValue = `${before.slice(0, atIndex)}@${user.name} ${after}`;
    setNoteText(nextValue);
    setMentionOpen(false);
    setMentionQuery('');
  };

  const handleAssignSelf = () => {
    if (!currentAssignee || isCurrentUserAssigned) return;
    const updatedInfo: FeatureDeploymentInfo = {
      ...deploymentInfo,
      assignedUsers: [...assignedUsers, currentAssignee],
      assignedTo: undefined,
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
  };

  const handleUnassignSelf = () => {
    if (!currentAssignee) return;
    const updatedInfo: FeatureDeploymentInfo = {
      ...deploymentInfo,
      assignedUsers: assignedUsers.filter(assignee =>
        !(
          (assignee.id && currentAssignee.id && assignee.id === currentAssignee.id) ||
          (assignee.email && currentAssignee.email && assignee.email === currentAssignee.email) ||
          assignee.name === currentAssignee.name
        )
      ),
      assignedTo: undefined,
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
  };

  const handleRemoveAssignee = (assigneeToRemove: AssignedUser) => {
    if (!isAdmin) return;
    const updatedInfo: FeatureDeploymentInfo = {
      ...deploymentInfo,
      assignedUsers: assignedUsers.filter(assignee =>
        !(
          (assignee.id && assigneeToRemove.id && assignee.id === assigneeToRemove.id) ||
          (assignee.email && assigneeToRemove.email && assignee.email === assigneeToRemove.email) ||
          assignee.name === assigneeToRemove.name
        )
      ),
      assignedTo: undefined,
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
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={deploymentInfo.status}
                onChange={(event) => handleStatusChange(event.target.value as FeatureDeploymentInfo['status'])}
              >
                {deploymentStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Assigned</Label>
              <div className="flex items-center gap-2">
                {isCurrentUserAssigned ? (
                  <Button variant="outline" size="sm" onClick={handleUnassignSelf}>
                    <UserMinus className="size-3 mr-1" />
                    Unassign me
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleAssignSelf}>
                    <UserPlus className="size-3 mr-1" />
                    Assign me
                  </Button>
                )}
              </div>
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
            {assignedUsers.length > 0 && (
              assignedUsers.map(assignee => (
                <Badge key={`${assignee.id || assignee.email || assignee.name}`} variant="outline" className="gap-2">
                  <User className="size-3" />
                  {assignee.name}
                  {(isAdmin || isSameAssignee(assignee, currentAssignee)) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isSameAssignee(assignee, currentAssignee)) {
                          handleUnassignSelf();
                        } else {
                          handleRemoveAssignee(assignee);
                        }
                      }}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </Badge>
              ))
            )}
          </div>

          <Separator />

          {/* Add Note Section */}
          <div className="space-y-3">
            <Label>Add Note</Label>
            <div className="relative">
              <Textarea
                placeholder="Add updates, blockers, or any relevant information..."
                value={noteText}
                onChange={(e) => handleNoteChange(e.target.value)}
                rows={3}
              />
              {mentionOpen && filteredUsers.length > 0 && (
                <div className="absolute z-20 mt-2 w-full rounded-md border border-border bg-background shadow-lg">
                  {filteredUsers.map(user => (
                    <button
                      key={user.id || user.name}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => insertMention(user)}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
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

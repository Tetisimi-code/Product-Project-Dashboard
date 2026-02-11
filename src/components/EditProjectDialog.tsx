import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { ProductCatalog, ProductFeature, Project } from '../App';
import { Badge } from './ui/badge';
import { UserPlus, UserMinus, X } from 'lucide-react';

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  products: ProductCatalog[];
  features: ProductFeature[];
  currentUser: any;
  isAdmin: boolean;
  onUpdate: (project: Project) => void;
}

export function EditProjectDialog({ open, onOpenChange, project, products, features, currentUser, isAdmin, onUpdate }: EditProjectDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('planning');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [location, setLocation] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [deployedFeatures, setDeployedFeatures] = useState<string[]>([]);
  const [assignees, setAssignees] = useState(project?.assignees || []);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setStatus(project.status);
      setStartDate(project.startDate);
      setEndDate(project.endDate);
      setProgress(project.progress);
      setLocation(project.location || '');
      setSelectedFeatures(project.featuresUsed);
      setDeployedFeatures(project.deployedFeatures);
      setAssignees(project.assignees || []);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (project) {
      const updatedProject: Project = {
        ...project,
        name,
        description,
        status,
        startDate,
        endDate,
        progress,
        location: location.trim() || undefined,
        featuresUsed: selectedFeatures,
        deployedFeatures: deployedFeatures.filter(id => selectedFeatures.includes(id)),
        assignees,
      };

      onUpdate(updatedProject);
      onOpenChange(false);
    }
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const toggleDeployedFeature = (featureId: string) => {
    setDeployedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const sortedProducts = [...products].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
  const featuresByProduct = features.reduce((acc, feature) => {
    if (!acc[feature.productId]) {
      acc[feature.productId] = [];
    }
    acc[feature.productId].push(feature);
    return acc;
  }, {} as Record<string, ProductFeature[]>);

  if (!project) return null;

  const currentUserId = currentUser?.id;
  const currentUserEmail = currentUser?.email;
  const currentUserName = currentUser?.user_metadata?.name || currentUserEmail?.split('@')[0] || 'User';
  const currentAssignee = currentUser
    ? { id: currentUserId, name: currentUserName, email: currentUserEmail }
    : null;
  const isSameAssignee = (assignee: { id?: string; name: string; email?: string }, target: { id?: string; name: string; email?: string } | null) => {
    if (!target) return false;
    return (
      (assignee.id && target.id && assignee.id === target.id) ||
      (assignee.email && target.email && assignee.email === target.email) ||
      assignee.name === target.name
    );
  };
  const isCurrentUserAssigned = currentAssignee
    ? assignees.some(assignee => isSameAssignee(assignee, currentAssignee))
    : false;

  const handleAssignSelf = () => {
    if (!currentAssignee || isCurrentUserAssigned) return;
    setAssignees(prev => [...prev, currentAssignee]);
  };

  const handleUnassignSelf = () => {
    if (!currentAssignee) return;
    setAssignees(prev => prev.filter(assignee => !isSameAssignee(assignee, currentAssignee)));
  };

  const handleRemoveAssignee = (assigneeToRemove: { id?: string; name: string; email?: string }) => {
    if (!isAdmin) return;
    setAssignees(prev => prev.filter(assignee => !isSameAssignee(assignee, assigneeToRemove)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project details and feature deployment status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Project Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Start Date</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-endDate">End Date</Label>
              <Input
                id="edit-endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as Project['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Progress: {progress}%</Label>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Region</Label>
            <Select value={location || 'none'} onValueChange={(value) => setLocation(value === 'none' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select project region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Region</SelectItem>
                <SelectItem value="Africa">Africa</SelectItem>
                <SelectItem value="Americas">Americas</SelectItem>
                <SelectItem value="Asia/Pacific (APAC)">Asia/Pacific (APAC)</SelectItem>
                <SelectItem value="Europe">Europe</SelectItem>
                <SelectItem value="Middle East">Middle East</SelectItem>
                <SelectItem value="UK/Ireland">UK/Ireland</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Project Assignments</Label>
              {isCurrentUserAssigned ? (
                <Button type="button" variant="ghost" size="sm" onClick={handleUnassignSelf} className="flex items-center gap-1">
                  <UserMinus className="size-3" />
                  Unassign me
                </Button>
              ) : (
                <Button type="button" variant="ghost" size="sm" onClick={handleAssignSelf} className="flex items-center gap-1">
                  <UserPlus className="size-3" />
                  Assign me
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {assignees.length > 0 ? (
                assignees.map(assignee => (
                  <Badge key={`${assignee.id || assignee.email || assignee.name}`} variant="secondary" className="flex items-center gap-1">
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
              ) : (
                <span className="text-sm text-muted-foreground">No assignees yet</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Features Used</Label>
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="space-y-4">
                {sortedProducts.map((product) => {
                  const productFeatures = (featuresByProduct[product.id] || []).sort((a, b) => {
                    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
                    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
                    if (orderA !== orderB) return orderA - orderB;
                    return a.name.localeCompare(b.name);
                  });

                  if (productFeatures.length === 0) return null;

                  return (
                    <div key={product.id} className="space-y-2">
                      <div>
                        <h4 className="text-slate-800">{product.name}</h4>
                        <p className="text-slate-500 text-sm">{product.description}</p>
                      </div>
                      <div className="space-y-2">
                        {productFeatures.map(feature => {
                          const isUsed = selectedFeatures.includes(feature.id);
                          const isDeployed = deployedFeatures.includes(feature.id);
                          
                          return (
                            <div key={feature.id} className="space-y-2 pl-4 border-l-2 border-slate-200">
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  id={`use-${feature.id}`}
                                  checked={isUsed}
                                  onCheckedChange={() => toggleFeature(feature.id)}
                                />
                                <div className="flex-1">
                                  <Label htmlFor={`use-${feature.id}`} className="cursor-pointer">
                                    {feature.name}
                                  </Label>
                                  <p className="text-slate-600">{feature.description}</p>
                                </div>
                              </div>
                              
                              {isUsed && (
                                <div className="flex items-center gap-2 ml-6">
                                  <Checkbox
                                    id={`deploy-${feature.id}`}
                                    checked={isDeployed}
                                    onCheckedChange={() => toggleDeployedFeature(feature.id)}
                                  />
                                  <Label htmlFor={`deploy-${feature.id}`} className="cursor-pointer text-slate-600">
                                    Deployed
                                  </Label>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

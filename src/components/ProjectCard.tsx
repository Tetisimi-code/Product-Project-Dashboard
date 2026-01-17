import { useState } from 'react';
import { ProductFeature, Project } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Calendar, CheckCircle2, Circle, Clock, Pencil, Trash2, Code, TestTube, Rocket, Ban, Undo, AlertCircle, ExternalLink, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { EditProjectDialog } from './EditProjectDialog';
import { FeatureDeploymentDialog } from './FeatureDeploymentDialog';
import { JiraLinkDialog } from './JiraLinkDialog';
import { TeamMember } from '../utils/api';

interface ProjectCardProps {
  project: Project;
  features: ProductFeature[];
  currentUser: any;
  teamMembers: TeamMember[];
  onUpdate: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onOpenAtlassianSettings?: () => void;
}

const statusConfig = {
  planning: { label: 'Planning', color: 'bg-blue-500', icon: Circle },
  'in-progress': { label: 'In Progress', color: 'bg-yellow-500', icon: Clock },
  deployed: { label: 'Deployed', color: 'bg-green-500', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'bg-slate-500', icon: CheckCircle2 },
};

const deploymentStatusIcons = {
  'not-started': Clock,
  'in-development': Code,
  'in-testing': TestTube,
  'staging': Rocket,
  'deployed': CheckCircle2,
  'blocked': Ban,
  'rolled-back': Undo,
};

const deploymentStatusColors = {
  'not-started': 'text-slate-500',
  'in-development': 'text-blue-500',
  'in-testing': 'text-yellow-500',
  'staging': 'text-purple-500',
  'deployed': 'text-green-500',
  'blocked': 'text-red-500',
  'rolled-back': 'text-orange-500',
};

export function ProjectCard({ project, features, currentUser, teamMembers, onUpdate, onDelete, onOpenAtlassianSettings }: ProjectCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isJiraLinkDialogOpen, setIsJiraLinkDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<ProductFeature | null>(null);
  const StatusIcon = statusConfig[project.status].icon;
  
  const usedFeatures = features.filter(f => project.featuresUsed.includes(f.id));
  const deployedCount = project.deployedFeatures.length;
  const totalCount = project.featuresUsed.length;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      onDelete(project.id);
    }
  };

  const handleJiraLink = (jiraKey: string, jiraUrl: string) => {
    const updatedProject = {
      ...project,
      jiraKey,
      jiraUrl,
    };
    onUpdate(updatedProject);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${statusConfig[project.status].color}`} />
              <span className="text-slate-700">{statusConfig[project.status].label}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="size-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline */}
          <div>
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <Calendar className="size-4" />
              <span>
                {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Overall Progress</span>
                <span className="text-slate-900">{project.progress}%</span>
              </div>
              <Progress value={project.progress} />
            </div>
          </div>

          {/* Feature Deployment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-700">Feature Deployment</span>
              <span className="text-slate-600">
                {deployedCount} / {totalCount} deployed
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {usedFeatures.map(feature => {
                const deploymentInfo = project.featureDeployments?.[feature.id];
                const status = deploymentInfo?.status || (project.deployedFeatures.includes(feature.id) ? 'deployed' : 'not-started');
                const DeploymentIcon = deploymentStatusIcons[status];
                const statusColor = deploymentStatusColors[status];
                const hasNotes = (deploymentInfo?.notes?.length || 0) > 0;
                
                return (
                  <Badge
                    key={feature.id}
                    variant={status === 'deployed' ? 'default' : 'outline'}
                    className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedFeature(feature)}
                  >
                    <DeploymentIcon className={`size-3 ${statusColor}`} />
                    {feature.name}
                    {hasNotes && (
                      <span className="ml-1 size-1.5 rounded-full bg-purple-500" />
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Feature Categories */}
          <div>
            <span className="text-slate-600">Categories Used</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {[...new Set(usedFeatures.map(f => f.category))].map(category => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Atlassian Integration */}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              {(project as any).jiraKey ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open((project as any).jiraUrl, '_blank')}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="size-3" />
                  Jira: {(project as any).jiraKey}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsJiraLinkDialogOpen(true)}
                  className="flex items-center gap-1 text-slate-600"
                >
                  <Link2 className="size-3" />
                  Link to Jira
                </Button>
              )}
              {(project as any).confluencePageUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open((project as any).confluencePageUrl, '_blank')}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="size-3" />
                  Confluence Docs
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <EditProjectDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={project}
        features={features}
        onUpdate={onUpdate}
      />

      <JiraLinkDialog
        open={isJiraLinkDialogOpen}
        onOpenChange={setIsJiraLinkDialogOpen}
        projectId={project.id}
        projectName={project.name}
        currentJiraKey={(project as any).jiraKey}
        onLink={handleJiraLink}
        onOpenSettings={onOpenAtlassianSettings}
      />

      {selectedFeature && (
        <FeatureDeploymentDialog
          open={!!selectedFeature}
          onOpenChange={(open) => !open && setSelectedFeature(null)}
          feature={selectedFeature}
          project={project}
          currentUser={currentUser}
          teamMembers={teamMembers}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
import { ProductFeature, Project } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { ProjectCard } from './ProjectCard';
import { Button } from './ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { TeamMember } from '../utils/api';

interface ProductProjectBoardProps {
  features: ProductFeature[];
  projects: Project[];
  categoryOrder: string[];
  currentUser: any;
  teamMembers: TeamMember[];
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onReorderCategory: (category: string, direction: 'up' | 'down') => void;
  onOpenAtlassianSettings?: () => void;
}

export function ProductProjectBoard({ features, projects, categoryOrder, currentUser, teamMembers, onUpdateProject, onDeleteProject, onReorderCategory, onOpenAtlassianSettings }: ProductProjectBoardProps) {
  // Group features by category
  const featuresByCategory = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, ProductFeature[]>);

  // Get projects using a specific feature
  const getProjectsUsingFeature = (featureId: string) => {
    return projects.filter(p => p.featuresUsed.includes(featureId));
  };

  // Sort categories according to categoryOrder
  const sortedCategories = categoryOrder.filter(cat => featuresByCategory[cat]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {/* Product Features Panel */}
      <div className="md:col-span-1 xl:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Product Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] md:h-[700px] xl:h-[800px]">
              <div className="space-y-4">
                {sortedCategories.map((category, index) => {
                  const categoryFeatures = featuresByCategory[category];
                  const canMoveUp = index > 0;
                  const canMoveDown = index < sortedCategories.length - 1;
                  
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-700">{category}</h3>
                        <div className="flex gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onReorderCategory(category, 'up')}
                            disabled={!canMoveUp}
                          >
                            <ChevronUp className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onReorderCategory(category, 'down')}
                            disabled={!canMoveDown}
                          >
                            <ChevronDown className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {categoryFeatures.map(feature => {
                          const projectsUsing = getProjectsUsingFeature(feature.id);
                          return (
                            <div
                              key={feature.id}
                              className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                            >
                              <div className="mb-1">
                                <div className="text-slate-900 mb-1 break-words">{feature.name}</div>
                                <p className="text-slate-600 break-words">{feature.description}</p>
                              </div>
                              <div className="flex items-center gap-1 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {projectsUsing.length} {projectsUsing.length === 1 ? 'project' : 'projects'}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Projects Panel */}
      <div className="md:col-span-1 xl:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] md:h-[700px] xl:h-[800px]">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4">
                {projects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    features={features}
                    currentUser={currentUser}
                    teamMembers={teamMembers}
                    onUpdate={onUpdateProject}
                    onDelete={onDeleteProject}
                    onOpenAtlassianSettings={onOpenAtlassianSettings}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
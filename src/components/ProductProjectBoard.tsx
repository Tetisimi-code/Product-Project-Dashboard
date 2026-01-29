import { ProductCatalog, ProductFeature, Project } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { ProjectCard } from './ProjectCard';
import { TeamMember } from '../utils/api';

interface ProductProjectBoardProps {
  products: ProductCatalog[];
  features: ProductFeature[];
  projects: Project[];
  currentUser: any;
  teamMembers: TeamMember[];
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenAtlassianSettings?: () => void;
}

export function ProductProjectBoard({ products, features, projects, currentUser, teamMembers, onUpdateProject, onDeleteProject, onOpenAtlassianSettings }: ProductProjectBoardProps) {
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
  const sortedFeaturesForProduct = (productId: string) => {
    return (featuresByProduct[productId] || []).sort((a, b) => {
      const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  };

  // Get projects using a specific feature
  const getProjectsUsingFeature = (featureId: string) => {
    return projects.filter(p => p.featuresUsed.includes(featureId));
  };

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
                {sortedProducts.map(product => {
                  const productFeatures = sortedFeaturesForProduct(product.id);
                  if (productFeatures.length === 0) return null;

                  return (
                    <div key={product.id} className="space-y-2">
                      <div>
                        <div className="font-medium text-foreground dark:text-white">{product.name}</div>
                        <p className="text-sm text-muted-foreground dark:text-white/70">{product.description}</p>
                      </div>
                      <div className="space-y-2">
                        {productFeatures.map(feature => {
                          const projectsUsing = getProjectsUsingFeature(feature.id);
                          return (
                            <div
                              key={feature.id}
                              className="p-4 rounded-lg border border-border bg-muted/40 hover:bg-muted/60 transition-colors dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                            >
                              <div className="mb-1">
                                <div className="mb-1 break-words text-foreground dark:text-white">{feature.name}</div>
                                <p className="break-words text-muted-foreground dark:text-white/70">{feature.description}</p>
                              </div>
                              <div className="flex items-center gap-1 mt-2">
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-muted/70 text-foreground border-border dark:bg-white/10 dark:text-white dark:border-white/10"
                                >
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
                    products={products}
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

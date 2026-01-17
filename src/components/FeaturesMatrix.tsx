import { ProductFeature, Project } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CheckCircle2, Circle, Package, TrendingUp } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface FeaturesMatrixProps {
  features: ProductFeature[];
  projects: Project[];
}

export function FeaturesMatrix({ features, projects }: FeaturesMatrixProps) {
  // Group features by category
  const featuresByCategory = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, ProductFeature[]>);

  // Calculate feature usage stats
  const getFeatureStats = (featureId: string) => {
    const projectsUsing = projects.filter(p => p.featuresUsed.includes(featureId));
    const projectsDeployed = projects.filter(p => p.deployedFeatures.includes(featureId));
    return {
      total: projectsUsing.length,
      deployed: projectsDeployed.length,
      inProgress: projectsUsing.filter(p => p.status === 'in-progress').length,
    };
  };

  // Calculate project usage stats
  const getProjectStats = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return { total: 0, deployed: 0 };
    return {
      total: project.featuresUsed.length,
      deployed: project.deployedFeatures.length,
    };
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="size-5 text-blue-600" />
              </div>
              <div>
                <div className="text-slate-600">Total Features</div>
                <div className="text-slate-900">{features.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="size-5 text-green-600" />
              </div>
              <div>
                <div className="text-slate-600">Features in Use</div>
                <div className="text-slate-900">
                  {features.filter(f => projects.some(p => p.featuresUsed.includes(f.id))).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="size-5 text-purple-600" />
              </div>
              <div>
                <div className="text-slate-600">Avg Features per Project</div>
                <div className="text-slate-900">
                  {projects.length > 0
                    ? Math.round(projects.reduce((sum, p) => sum + p.featuresUsed.length, 0) / projects.length)
                    : 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-64 sticky left-0 bg-white z-10">Feature</TableHead>
                  <TableHead className="w-32">Category</TableHead>
                  {projects.map(project => (
                    <TableHead key={project.id} className="min-w-32">
                      <div className="truncate">{project.name}</div>
                      <div className="text-slate-500">{project.status}</div>
                    </TableHead>
                  ))}
                  <TableHead className="w-32">Usage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((feature) => {
                  const stats = getFeatureStats(feature.id);
                  return (
                    <TableRow key={feature.id}>
                      <TableCell className="sticky left-0 bg-white z-10">
                        <div>
                          <div className="text-slate-900">{feature.name}</div>
                          <div className="text-slate-600">{feature.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{feature.category}</Badge>
                      </TableCell>
                      {projects.map(project => {
                        const isUsed = project.featuresUsed.includes(feature.id);
                        const isDeployed = project.deployedFeatures.includes(feature.id);
                        return (
                          <TableCell key={project.id} className="text-center">
                            {isUsed ? (
                              <div className="flex items-center justify-center">
                                {isDeployed ? (
                                  <CheckCircle2 className="size-5 text-green-600" />
                                ) : (
                                  <Circle className="size-5 text-yellow-600" />
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <div className="size-1.5 rounded-full bg-slate-200" />
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-slate-900">{stats.total} projects</div>
                          <div className="text-slate-600">{stats.deployed} deployed</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Project Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Project Feature Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Features</TableHead>
                <TableHead>Deployed Features</TableHead>
                <TableHead>Deployment Rate</TableHead>
                <TableHead>Categories Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(project => {
                const stats = getProjectStats(project.id);
                const deploymentRate = stats.total > 0 ? Math.round((stats.deployed / stats.total) * 100) : 0;
                const usedFeatures = features.filter(f => project.featuresUsed.includes(f.id));
                const categories = [...new Set(usedFeatures.map(f => f.category))];

                return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="text-slate-900">{project.name}</div>
                        <div className="text-slate-600">{project.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{project.status}</Badge>
                    </TableCell>
                    <TableCell>{stats.total}</TableCell>
                    <TableCell>{stats.deployed}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600"
                            style={{ width: `${deploymentRate}%` }}
                          />
                        </div>
                        <span className="text-slate-700">{deploymentRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {categories.map(category => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-slate-600">Matrix Legend:</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-green-600" />
              <span className="text-slate-700">Deployed</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="size-5 text-yellow-600" />
              <span className="text-slate-700">In Development</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-slate-200" />
              <span className="text-slate-700">Not Used</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

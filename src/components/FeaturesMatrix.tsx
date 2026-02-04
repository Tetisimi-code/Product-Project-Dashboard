import { ProductCatalog, ProductFeature, Project } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CheckCircle2, Circle, Package, TrendingUp } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface FeaturesMatrixProps {
  products: ProductCatalog[];
  features: ProductFeature[];
  projects: Project[];
}

export function FeaturesMatrix({ products, features, projects }: FeaturesMatrixProps) {
  const { theme } = useTheme();
  const productMap = new Map(products.map((product) => [product.id, product.name]));
  const sortedFeatures = [...features].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
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

  const gridTemplateColumns = `16rem 12rem repeat(${projects.length}, minmax(8rem, 1fr)) 8rem`;
  const gridMinWidth = `${36 + projects.length * 8}rem`;
  const stickyBg = theme === 'dark' ? '#0f172a' : '#ffffff';
  const gridContainerClass = theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white';
  const gridRowBorderClass = theme === 'dark' ? 'border-white/10' : 'border-slate-200';
  const featureNameClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const featureDescClass = theme === 'dark' ? 'text-white/70' : 'text-slate-600';

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
          <div className="h-[600px] overflow-auto">
            <div>
              <div
                style={{ minWidth: gridMinWidth }}
                className={`rounded-lg border ${gridContainerClass}`}
              >
                <div
                  className={`grid text-sm font-medium border-b ${gridRowBorderClass}`}
                  style={{ gridTemplateColumns }}
                >
                  <div
                    className={`sticky left-0 z-30 px-3 py-3 border-r ${gridRowBorderClass} shadow-[2px_0_8px_rgba(0,0,0,0.08)] dark:shadow-[2px_0_8px_rgba(0,0,0,0.45)]`}
                    style={{ backgroundColor: stickyBg }}
                  >
                    Feature
                  </div>
                  <div
                    className={`sticky z-20 px-3 py-3 border-r ${gridRowBorderClass} shadow-[2px_0_8px_rgba(0,0,0,0.08)] dark:shadow-[2px_0_8px_rgba(0,0,0,0.45)]`}
                    style={{ left: '16rem', backgroundColor: stickyBg }}
                  >
                    Product
                  </div>
                  {projects.map(project => (
                    <div key={project.id} className="px-3 py-3">
                      <div className="truncate">{project.name}</div>
                      <div className="text-slate-500">{project.status}</div>
                    </div>
                  ))}
                  <div className="px-3 py-3">Usage</div>
                </div>

                {sortedFeatures.map((feature) => {
                  const stats = getFeatureStats(feature.id);
                  return (
                    <div
                      key={feature.id}
                      className={`grid border-b ${gridRowBorderClass}`}
                      style={{ gridTemplateColumns }}
                    >
                      <div
                        className={`sticky left-0 z-20 px-3 py-3 border-r ${gridRowBorderClass} shadow-[2px_0_8px_rgba(0,0,0,0.08)] dark:shadow-[2px_0_8px_rgba(0,0,0,0.45)]`}
                        style={{ backgroundColor: stickyBg }}
                      >
                        <div className={`${featureNameClass} font-semibold`}>{feature.name}</div>
                        <div className={featureDescClass}>{feature.description}</div>
                      </div>
                      <div
                        className={`sticky z-10 px-3 py-3 border-r ${gridRowBorderClass} flex items-center shadow-[2px_0_8px_rgba(0,0,0,0.08)] dark:shadow-[2px_0_8px_rgba(0,0,0,0.45)]`}
                        style={{ left: '16rem', backgroundColor: stickyBg }}
                      >
                        <Badge variant="secondary" className="max-w-full whitespace-normal break-words text-left leading-snug">
                          {productMap.get(feature.productId) || 'Unknown'}
                        </Badge>
                      </div>
                      {projects.map(project => {
                        const isUsed = project.featuresUsed.includes(feature.id);
                        const isDeployed = project.deployedFeatures.includes(feature.id);
                        return (
                          <div key={project.id} className="flex items-center justify-center px-3 py-3">
                            {isUsed ? (
                              <div className="flex items-center justify-center">
                                {isDeployed ? (
                                  <CheckCircle2 className="size-5 text-green-600" />
                                ) : (
                                  <Circle className="size-5 text-yellow-600" />
                                )}
                              </div>
                            ) : (
                              <div className="size-1.5 rounded-full bg-slate-200" />
                            )}
                          </div>
                        );
                      })}
                      <div className="px-3 py-3">
                        <div className="space-y-1">
                          <div className="text-slate-900">{stats.total} projects</div>
                          <div className="text-slate-600">{stats.deployed} deployed</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(project => {
                const stats = getProjectStats(project.id);
                const deploymentRate = stats.total > 0 ? Math.round((stats.deployed / stats.total) * 100) : 0;

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

import { ProductFeature, Project } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { format, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from 'date-fns';
import { Calendar } from 'lucide-react';

interface TimelineViewProps {
  features: ProductFeature[];
  projects: Project[];
}

export function TimelineView({ projects }: TimelineViewProps) {
  // Calculate the overall timeline range
  const allDates = projects.flatMap(p => [new Date(p.startDate), new Date(p.endDate)]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

  // Get months in the range
  const months = eachMonthOfInterval({ start: startOfMonth(minDate), end: endOfMonth(maxDate) });
  const totalDays = differenceInDays(maxDate, minDate);

  // Fixed pixel width per day for consistent spacing
  const PIXELS_PER_DAY = 3;
  const timelineWidth = totalDays * PIXELS_PER_DAY;

  const getProjectPosition = (project: Project) => {
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);
    const startOffset = differenceInDays(projectStart, minDate);
    const duration = differenceInDays(projectEnd, projectStart);

    return {
      left: `${startOffset * PIXELS_PER_DAY}px`,
      width: `${duration * PIXELS_PER_DAY}px`,
    };
  };

  const statusColors = {
    planning: 'bg-blue-500',
    'in-progress': 'bg-yellow-500',
    deployed: 'bg-green-500',
    completed: 'bg-slate-500',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Scrollable container for timeline */}
          <div className="overflow-x-auto overflow-y-visible pb-4">
            <div className="space-y-6">
              {/* Timeline Header - Months */}
              <div className="relative border-b border-slate-200 pb-3">
                <div className="flex" style={{ width: `${timelineWidth}px` }}>
                  {months.map((month, idx) => {
                    const monthStart = startOfMonth(month);
                    const monthEnd = endOfMonth(month);
                    const monthDuration = differenceInDays(monthEnd, monthStart) + 1;
                    const monthWidth = monthDuration * PIXELS_PER_DAY;

                    return (
                      <div
                        key={idx}
                        className="border-l border-slate-200 px-2 flex flex-col items-center justify-center"
                        style={{ width: `${monthWidth}px` }}
                      >
                        <span className="text-sm text-slate-600 font-medium whitespace-nowrap">
                          {format(month, 'MMM')}
                        </span>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {format(month, 'yyyy')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Projects - Wrapped in relative container for today marker */}
              <div className="relative">
                {/* Today indicator */}
                {(() => {
                  const today = new Date();
                  if (today >= minDate && today <= maxDate) {
                    const todayOffset = differenceInDays(today, minDate);
                    const todayPosition = todayOffset * PIXELS_PER_DAY;
                    return (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                        style={{ left: `calc(12rem + ${todayPosition}px)` }}
                      >
                        <div className="absolute -top-6 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          Today
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Projects */}
                <div className="space-y-4">
                  {projects.map((project) => {
                    const position = getProjectPosition(project);
                    return (
                      <div key={project.id} className="space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="w-48 flex-shrink-0">
                            <div className="text-sm text-slate-900 font-medium">{project.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {project.status}
                              </Badge>
                              <span className="text-xs text-slate-600">{project.progress}%</span>
                            </div>
                          </div>
                          <div className="relative h-12" style={{ width: `${timelineWidth}px` }}>
                            {/* Timeline bar */}
                            <div
                              className={`absolute top-0 h-8 rounded ${statusColors[project.status]} opacity-80 hover:opacity-100 transition-opacity cursor-pointer group`}
                              style={position}
                            >
                              <div className="absolute inset-0 flex items-center justify-center px-2">
                                <span className="text-white text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                  {format(new Date(project.startDate), 'MMM d')} - {format(new Date(project.endDate), 'MMM d')}
                                </span>
                              </div>
                              {/* Progress indicator */}
                              <div
                                className="h-full bg-slate-900 opacity-20 rounded-l"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-slate-600 mb-1">Total Projects</div>
            <div className="text-slate-900">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-slate-600 mb-1">In Progress</div>
            <div className="text-slate-900">
              {projects.filter(p => p.status === 'in-progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-slate-600 mb-1">Deployed</div>
            <div className="text-slate-900">
              {projects.filter(p => p.status === 'deployed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-slate-600 mb-1">Average Progress</div>
            <div className="text-slate-900">
              {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-slate-600">Status:</span>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-blue-500" />
              <span className="text-slate-700">Planning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-yellow-500" />
              <span className="text-slate-700">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-green-500" />
              <span className="text-slate-700">Deployed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-slate-500" />
              <span className="text-slate-700">Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
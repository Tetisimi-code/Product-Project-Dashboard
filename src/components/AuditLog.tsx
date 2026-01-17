import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Clock, User, FileEdit, Trash2, Plus, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: 'create' | 'update' | 'delete' | 'reorder';
  entityType: 'project' | 'feature' | 'category';
  entityName: string;
  details?: string;
}

interface AuditLogProps {
  entries: AuditEntry[];
}

export function AuditLog({ entries }: AuditLogProps) {
  const getActionIcon = (action: AuditEntry['action']) => {
    switch (action) {
      case 'create':
        return <Plus className="size-4" />;
      case 'update':
        return <FileEdit className="size-4" />;
      case 'delete':
        return <Trash2 className="size-4" />;
      case 'reorder':
        return <ArrowUpDown className="size-4" />;
    }
  };

  const getActionColor = (action: AuditEntry['action']) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delete':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reorder':
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getEntityBadgeColor = (entityType: AuditEntry['entityType']) => {
    switch (entityType) {
      case 'project':
        return 'bg-slate-100 text-slate-800';
      case 'feature':
        return 'bg-indigo-100 text-indigo-800';
      case 'category':
        return 'bg-violet-100 text-violet-800';
    }
  };

  // Sort entries by timestamp, newest first
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Activity Log
          </CardTitle>
          <p className="text-slate-600">Track all changes made to projects, features, and categories</p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {sortedEntries.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No activity recorded yet
              </div>
            ) : (
              <div className="space-y-3">
                {sortedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={`${getActionColor(entry.action)} border`}
                          >
                            <span className="flex items-center gap-1">
                              {getActionIcon(entry.action)}
                              {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                            </span>
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={getEntityBadgeColor(entry.entityType)}
                          >
                            {entry.entityType.charAt(0).toUpperCase() + entry.entityType.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="text-slate-900">
                          <span className="font-medium">{entry.entityName}</span>
                        </div>
                        
                        {entry.details && (
                          <p className="text-slate-600">{entry.details}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <User className="size-3.5" />
                            {entry.user}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

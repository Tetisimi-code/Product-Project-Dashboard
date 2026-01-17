import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Search, Filter, MapPin, User } from 'lucide-react';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  regionFilter: string;
  onRegionFilterChange: (value: string) => void;
  showMyProjects: boolean;
  onShowMyProjectsChange: (value: boolean) => void;
  resultCount: number;
  totalCount: number;
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  regionFilter,
  onRegionFilterChange,
  showMyProjects,
  onShowMyProjectsChange,
  resultCount,
  totalCount
}: SearchFilterProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 size-4" />
          <Input
            type="text"
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15"
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <div className="flex items-center gap-2">
                <Filter className="size-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-52">
          <Select value={regionFilter} onValueChange={onRegionFilterChange}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <SelectValue placeholder="Filter by region" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="africa">Africa</SelectItem>
              <SelectItem value="americas">Americas</SelectItem>
              <SelectItem value="apac">Asia/Pacific (APAC)</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="middle-east">Middle East</SelectItem>
              <SelectItem value="uk-ireland">UK/Ireland</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant={showMyProjects ? "default" : "outline"}
          onClick={() => onShowMyProjectsChange(!showMyProjects)}
          className={showMyProjects 
            ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-600" 
            : "bg-white/10 border-white/20 text-white hover:bg-white/15"
          }
        >
          <User className="size-4 mr-2" />
          My Projects
        </Button>
      </div>
      
      {(searchQuery || statusFilter !== 'all' || regionFilter !== 'all' || showMyProjects) && (
        <div className="mt-3 text-white/70">
          Showing {resultCount} of {totalCount} projects
          {searchQuery && (
            <span className="ml-1">
              matching "{searchQuery}"
            </span>
          )}
          {showMyProjects && (
            <span className="ml-1 text-purple-300">
              • Assigned to you
            </span>
          )}
        </div>
      )}
    </div>
  );
}
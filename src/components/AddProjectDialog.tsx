import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { ProductCatalog, ProductFeature, Project } from '../App';

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductCatalog[];
  features: ProductFeature[];
  onAdd: (project: Project) => void;
}

export function AddProjectDialog({ open, onOpenChange, products, features, onAdd }: AddProjectDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('planning');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      id: `p${Date.now()}`,
      name,
      description,
      status,
      startDate,
      endDate,
      progress: status === 'planning' ? 0 : 10,
      featuresUsed: selectedFeatures,
      deployedFeatures: [],
      location: location.trim() || undefined,
    };

    onAdd(newProject);
    
    // Reset form
    setName('');
    setDescription('');
    setStatus('planning');
    setStartDate('');
    setEndDate('');
    setLocation('');
    setSelectedFeatures([]);
    onOpenChange(false);
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Create a new project and select the product features it will use.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Region <span className="text-slate-500">(Optional)</span></Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
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
                        {productFeatures.map((feature) => (
                          <div key={feature.id} className="flex items-start gap-2">
                            <Checkbox
                              id={feature.id}
                              checked={selectedFeatures.includes(feature.id)}
                              onCheckedChange={() => toggleFeature(feature.id)}
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={feature.id}
                                className="cursor-pointer"
                              >
                                {feature.name}
                              </Label>
                              <p className="text-slate-600">{feature.description}</p>
                            </div>
                          </div>
                        ))}
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
            <Button type="submit">Add Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

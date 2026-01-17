import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ProductFeature } from '../App';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface ManageFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  features: ProductFeature[];
  categoryOrder: string[];
  onAdd: (feature: ProductFeature) => void;
  onUpdate: (feature: ProductFeature) => void;
  onDelete: (featureId: string) => void;
  onUpdateCategoryOrder: (categoryOrder: string[]) => void;
}

export function ManageFeaturesDialog({ open, onOpenChange, features, categoryOrder, onAdd, onUpdate, onDelete, onUpdateCategoryOrder }: ManageFeaturesDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingFeature, setEditingFeature] = useState<ProductFeature | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  // Category deletion states
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [reassignCategory, setReassignCategory] = useState('');
  
  // Category renaming states
  const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Adding new category state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [addCategoryName, setAddCategoryName] = useState('');

  // Get all unique categories from existing features
  const existingCategories = [...new Set(features.map(f => f.category))].sort();
  const categories = [...existingCategories, 'Custom...'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = isCustomCategory ? customCategory : category;
    
    if (editingFeature) {
      // Update existing feature
      onUpdate({
        ...editingFeature,
        name,
        description,
        category: finalCategory,
      });
    } else {
      // Add new feature
      const newFeature: ProductFeature = {
        id: `f${Date.now()}`,
        name,
        description,
        category: finalCategory,
      };
      onAdd(newFeature);
    }

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('');
    setCustomCategory('');
    setIsCustomCategory(false);
    setEditingFeature(null);
    setIsEditing(false);
  };

  const startEdit = (feature: ProductFeature) => {
    setEditingFeature(feature);
    setName(feature.name);
    setDescription(feature.description);
    
    // Check if category exists in our list
    if (existingCategories.includes(feature.category)) {
      setCategory(feature.category);
      setIsCustomCategory(false);
    } else {
      setCategory('Custom...');
      setCustomCategory(feature.category);
      setIsCustomCategory(true);
    }
    
    setIsEditing(true);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    if (value === 'Custom...') {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
      setCustomCategory('');
    }
  };

  const handleDelete = (featureId: string) => {
    if (confirm('Are you sure you want to delete this feature?')) {
      onDelete(featureId);
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    const categoryFeatures = featuresByCategory[categoryName] || [];
    
    if (categoryFeatures.length === 0) {
      // No features in this category, nothing to do
      return;
    }
    
    // Show dialog to reassign features
    setDeletingCategory(categoryName);
    setReassignCategory('');
  };

  const confirmDeleteCategory = () => {
    if (!deletingCategory || !reassignCategory) return;
    
    const categoryFeatures = featuresByCategory[deletingCategory] || [];
    
    // Reassign all features to the new category
    categoryFeatures.forEach(feature => {
      onUpdate({
        ...feature,
        category: reassignCategory
      });
    });
    
    // Remove the deleted category from categoryOrder
    const newOrder = categoryOrder.filter(cat => cat !== deletingCategory);
    onUpdateCategoryOrder(newOrder);
    
    // Reset state
    setDeletingCategory(null);
    setReassignCategory('');
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    if (!newName || newName === oldName) return;
    
    const categoryFeatures = featuresByCategory[oldName] || [];
    
    // Update all features in this category
    categoryFeatures.forEach(feature => {
      onUpdate({
        ...feature,
        category: newName
      });
    });
    
    // Update the categoryOrder to replace old name with new name
    const newOrder = categoryOrder.map(cat => cat === oldName ? newName : cat);
    onUpdateCategoryOrder(newOrder);
  };

  // Group features by category
  const featuresByCategory = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, ProductFeature[]>);

  // Get available categories for reassignment (excluding the one being deleted)
  const getReassignmentCategories = () => {
    return existingCategories.filter(cat => cat !== deletingCategory);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Product Features</DialogTitle>
            <DialogDescription>
              Add, edit, or remove product features and categories.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="features" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="flex-1 grid grid-cols-2 gap-6 overflow-hidden mt-4">
              {/* Feature List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-900">Existing Features</h3>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      resetForm();
                      setIsEditing(true);
                    }}
                  >
                    <Plus className="size-4 mr-2" />
                    New
                  </Button>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4 pr-4">
                    {Object.entries(featuresByCategory).map(([cat, categoryFeatures]) => (
                      <div key={cat}>
                        <h4 className="text-slate-700 mb-2">{cat}</h4>
                        <div className="space-y-2">
                          {categoryFeatures.map((feature) => (
                            <div
                              key={feature.id}
                              className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="text-slate-900 mb-1">{feature.name}</div>
                                  <p className="text-slate-600">{feature.description}</p>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEdit(feature)}
                                  >
                                    <Pencil className="size-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(feature.id)}
                                  >
                                    <Trash2 className="size-4 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Feature Form */}
              <div className="border-l pl-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-slate-900">
                      {editingFeature ? 'Edit Feature' : 'Add New Feature'}
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="feature-name">Feature Name</Label>
                      <Input
                        id="feature-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter feature name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="feature-description">Description</Label>
                      <Textarea
                        id="feature-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the feature"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="feature-category">Category</Label>
                      <Select value={category} onValueChange={handleCategoryChange} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {isCustomCategory && (
                        <Input
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Enter custom category name"
                          required
                        />
                      )}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingFeature ? 'Update Feature' : 'Add Feature'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    Select a feature to edit or click "New" to add one
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="categories" className="flex-1 overflow-hidden mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-slate-900 mb-2">Manage Categories</h3>
                    <p className="text-slate-600">
                      Add, rename, or delete feature categories.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setIsAddingCategory(true);
                      setAddCategoryName('');
                    }}
                  >
                    <Plus className="size-4 mr-2" />
                    New Category
                  </Button>
                </div>
                
                {isAddingCategory && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (addCategoryName && !existingCategories.includes(addCategoryName)) {
                        // Create a placeholder feature for this category
                        const placeholderFeature: ProductFeature = {
                          id: `f${Date.now()}`,
                          name: `${addCategoryName} Feature`,
                          description: 'Placeholder feature - edit or delete as needed',
                          category: addCategoryName,
                        };
                        onAdd(placeholderFeature);
                      }
                      setIsAddingCategory(false);
                      setAddCategoryName('');
                    }}
                    className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200 space-y-3"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="new-category-name">New Category Name</Label>
                      <Input
                        id="new-category-name"
                        value={addCategoryName}
                        onChange={(e) => setAddCategoryName(e.target.value)}
                        placeholder="Enter category name"
                        autoFocus
                        required
                      />
                      {existingCategories.includes(addCategoryName) && (
                        <p className="text-red-600">This category already exists</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={!addCategoryName || existingCategories.includes(addCategoryName)}>
                        Add Category
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddingCategory(false);
                          setAddCategoryName('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
                
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2 pr-4">
                    {existingCategories.map((cat) => {
                      const count = featuresByCategory[cat]?.length || 0;
                      const isRenaming = renamingCategory === cat;
                      
                      return (
                        <div
                          key={cat}
                          className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <FolderOpen className="size-5 text-purple-600" />
                              {isRenaming ? (
                                <Input
                                  value={newCategoryName}
                                  onChange={(e) => setNewCategoryName(e.target.value)}
                                  onBlur={() => {
                                    if (newCategoryName && newCategoryName !== cat) {
                                      handleRenameCategory(cat, newCategoryName);
                                    }
                                    setRenamingCategory(null);
                                    setNewCategoryName('');
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      if (newCategoryName && newCategoryName !== cat) {
                                        handleRenameCategory(cat, newCategoryName);
                                      }
                                      setRenamingCategory(null);
                                      setNewCategoryName('');
                                    } else if (e.key === 'Escape') {
                                      setRenamingCategory(null);
                                      setNewCategoryName('');
                                    }
                                  }}
                                  autoFocus
                                  className="flex-1"
                                />
                              ) : (
                                <div className="flex-1">
                                  <div className="text-slate-900">{cat}</div>
                                  <p className="text-slate-600">
                                    {count} {count === 1 ? 'feature' : 'features'}
                                  </p>
                                </div>
                              )}
                            </div>
                            {!isRenaming && (
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setRenamingCategory(cat);
                                    setNewCategoryName(cat);
                                  }}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCategory(cat)}
                                  disabled={count === 0}
                                >
                                  <Trash2 className="size-4 text-red-600" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {existingCategories.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        No categories yet. Create a feature to add categories.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Category Deletion Confirmation Dialog */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reassign Features</AlertDialogTitle>
            <AlertDialogDescription>
              The category "{deletingCategory}" has {featuresByCategory[deletingCategory || '']?.length || 0} features.
              Please select a category to move these features to.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="reassign-category">Move features to:</Label>
            <Select value={reassignCategory} onValueChange={setReassignCategory}>
              <SelectTrigger id="reassign-category" className="mt-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {getReassignmentCategories().map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} disabled={!reassignCategory}>
              Move Features
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
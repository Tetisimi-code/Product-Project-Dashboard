import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ProductCatalog, ProductFeature } from '../App';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ManageFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductCatalog[];
  features: ProductFeature[];
  onAddProduct: (product: ProductCatalog) => void;
  onUpdateProduct: (product: ProductCatalog) => void;
  onDeleteProduct: (productId: string) => void;
  onAdd: (feature: ProductFeature) => void;
  onUpdate: (feature: ProductFeature) => void;
  onDelete: (featureId: string) => void;
}

const slugifyId = (value: string) => {
  const cleaned = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return cleaned;
};

export function ManageFeaturesDialog({ open, onOpenChange, products, features, onAddProduct, onUpdateProduct, onDeleteProduct, onAdd, onUpdate, onDelete }: ManageFeaturesDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingFeature, setEditingFeature] = useState<ProductFeature | null>(null);
  const [featureId, setFeatureId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductCatalog | null>(null);
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productManualUrl, setProductManualUrl] = useState('');
  const [productOrder, setProductOrder] = useState('');

  const sortedProducts = [...products].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
  const sortedFeatures = [...features].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });

  const resetForm = () => {
    setFeatureId('');
    setName('');
    setDescription('');
    setDisplayOrder('');
    setSelectedProductId('');
    setEditingFeature(null);
    setIsEditing(false);
  };

  const startEdit = (feature: ProductFeature) => {
    setEditingFeature(feature);
    setFeatureId(feature.id);
    setSelectedProductId(feature.productId);
    setName(feature.name);
    setDescription(feature.description);
    setDisplayOrder(feature.displayOrder !== null && feature.displayOrder !== undefined ? String(feature.displayOrder) : '');
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    const parsedOrder = displayOrder.trim() === '' ? null : Number(displayOrder);
    const normalizedOrder = Number.isFinite(parsedOrder) ? parsedOrder : null;

    if (!selectedProductId) {
      return;
    }

    if (editingFeature) {
      onUpdate({
        ...editingFeature,
        productId: selectedProductId,
        name,
        description,
        displayOrder: normalizedOrder,
      });
    } else {
      const generatedId = featureId.trim() || slugifyId(name) || `product_${Date.now()}`;
      const newFeature: ProductFeature = {
        id: generatedId,
        productId: selectedProductId,
        name,
        description,
        displayOrder: normalizedOrder,
      };
      onAdd(newFeature);
    }

    resetForm();
  };

  const handleDelete = (featureIdToDelete: string) => {
    if (confirm('Are you sure you want to delete this feature?')) {
      onDelete(featureIdToDelete);
    }
  };

  const isFormDisabled = !isEditing;
  const isProductFormDisabled = !isEditingProduct;

  const resetProductForm = () => {
    setProductId('');
    setProductName('');
    setProductDescription('');
    setProductManualUrl('');
    setProductOrder('');
    setEditingProduct(null);
    setIsEditingProduct(false);
  };

  const startProductEdit = (product: ProductCatalog) => {
    setEditingProduct(product);
    setProductId(product.id);
    setProductName(product.name);
    setProductDescription(product.description);
    setProductManualUrl(product.manualUrl || '');
    setProductOrder(product.displayOrder !== null && product.displayOrder !== undefined ? String(product.displayOrder) : '');
    setIsEditingProduct(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingProduct) return;

    const parsedOrder = productOrder.trim() === '' ? null : Number(productOrder);
    const normalizedOrder = Number.isFinite(parsedOrder) ? parsedOrder : null;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: productName,
        description: productDescription,
        manualUrl: productManualUrl.trim() || null,
        displayOrder: normalizedOrder,
      });
    } else {
      const generatedId = productId.trim() || slugifyId(productName) || `product_${Date.now()}`;
      onAddProduct({
        id: generatedId,
        name: productName,
        description: productDescription,
        manualUrl: productManualUrl.trim() || null,
        displayOrder: normalizedOrder,
      });
    }

    resetProductForm();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      onOpenChange(nextOpen);
      if (!nextOpen) resetForm();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Products & Features</DialogTitle>
          <DialogDescription>
            Add, edit, or remove products and their feature sets.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="products" className="flex-1 flex flex-col overflow-hidden mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="flex-1 grid grid-cols-2 gap-6 overflow-hidden mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900">Catalog Entries</h3>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    resetProductForm();
                    setIsEditingProduct(true);
                  }}
                >
                  <Plus className="size-4 mr-1" />
                  New
                </Button>
              </div>
              <ScrollArea className="h-[520px] pr-4">
                <div className="space-y-2">
                  {sortedProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`p-3 rounded-lg border transition-colors ${editingProduct?.id === product.id ? 'border-slate-400 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-slate-900 break-words">{product.name}</div>
                          <div className="text-slate-600 text-sm break-words">{product.description}</div>
                          {product.manualUrl && (
                            <div className="text-slate-500 text-xs mt-1 break-words">{product.manualUrl}</div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => startProductEdit(product)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this product and its features?')) {
                                onDeleteProduct(product.id);
                              }
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <form onSubmit={handleProductSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-id">Product ID</Label>
                <Input
                  id="product-id"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="auto-generated if blank"
                  disabled={isProductFormDisabled || !!editingProduct}
                />
                {!editingProduct && (
                  <p className="text-xs text-slate-500">
                    Leave blank to auto-generate from the product name.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
                  required
                  disabled={isProductFormDisabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Describe the product"
                  required
                  disabled={isProductFormDisabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-manual">Manual URL</Label>
                <Input
                  id="product-manual"
                  value={productManualUrl}
                  onChange={(e) => setProductManualUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={isProductFormDisabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-order">Display Order</Label>
                <Input
                  id="product-order"
                  type="number"
                  value={productOrder}
                  onChange={(e) => setProductOrder(e.target.value)}
                  placeholder="Optional"
                  disabled={isProductFormDisabled}
                />
              </div>
              <DialogFooter className="mt-auto">
                <Button type="button" variant="outline" onClick={resetProductForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isProductFormDisabled}>
                  {editingProduct ? 'Update' : 'Add'} Product
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="features" className="flex-1 grid grid-cols-2 gap-6 overflow-hidden mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900">Feature Entries</h3>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    resetForm();
                    setIsEditing(true);
                  }}
                >
                  <Plus className="size-4 mr-1" />
                  New
                </Button>
              </div>
              <ScrollArea className="h-[520px] pr-4">
                <div className="space-y-2">
                  {sortedFeatures.map((feature) => {
                    const productNameForFeature = products.find((product) => product.id === feature.productId)?.name || 'Unknown';
                    return (
                      <div
                        key={feature.id}
                        className={`p-3 rounded-lg border transition-colors ${editingFeature?.id === feature.id ? 'border-slate-400 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-slate-900 break-words">{feature.name}</div>
                            <div className="text-slate-600 text-sm break-words">{feature.description}</div>
                            <div className="text-slate-500 text-xs mt-1 break-words">{productNameForFeature}</div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => startEdit(feature)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(feature.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="feature-id">Feature ID</Label>
                <Input
                  id="feature-id"
                  value={featureId}
                  onChange={(e) => setFeatureId(e.target.value)}
                  placeholder="auto-generated if blank"
                  disabled={isFormDisabled || !!editingFeature}
                />
                {!editingFeature && (
                  <p className="text-xs text-slate-500">
                    Leave blank to auto-generate from the feature name.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={isFormDisabled}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feature-name">Feature Name</Label>
                <Input
                  id="feature-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter feature name"
                  required
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feature-order">Display Order</Label>
                <Input
                  id="feature-order"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  placeholder="Optional"
                  disabled={isFormDisabled}
                />
              </div>
              <DialogFooter className="mt-auto">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isFormDisabled}>
                  {editingFeature ? 'Update' : 'Add'} Feature
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

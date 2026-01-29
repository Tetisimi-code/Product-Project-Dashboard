import { useMemo, useState } from 'react';
import { ProductCatalog, ProductFeature } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { UploadCloud, FileText, FolderUp, FileUp, Download, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase/client';

const bucketName = 'product-manuals';
const templatePath = '_templates/user-manual-template.docx';

const docFileNameFor = (fileName: string) => {
  const extension = fileName.includes('.') ? fileName.split('.').pop() : 'docx';
  return `manual.${extension}`;
};

const buildPublicUrl = (path: string) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
};

const slugifyId = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

interface ProductDocsManagerProps {
  products: ProductCatalog[];
  features: ProductFeature[];
  onAddProduct: (product: ProductCatalog) => Promise<void>;
  onUpdateProduct: (product: ProductCatalog) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onAddFeature: (feature: ProductFeature) => Promise<void>;
  onUpdateFeature: (feature: ProductFeature) => Promise<void>;
  onDeleteFeature: (featureId: string) => Promise<void>;
}

export function ProductDocsManager({
  products,
  features,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature,
}: ProductDocsManagerProps) {
  const [uploads, setUploads] = useState<Record<string, { manual?: File | null }>>({});
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [templateFileName, setTemplateFileName] = useState('');
  const [manualFileNames, setManualFileNames] = useState<Record<string, string>>({});
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

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  }, [products]);

  const sortedFeatures = useMemo(() => {
    return [...features].sort((a, b) => {
      const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  }, [features]);

  const handleFileChange = (productId: string, file: File | null) => {
    setManualFileNames(prev => ({
      ...prev,
      [productId]: file?.name || '',
    }));
    setUploads(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        manual: file,
      },
    }));
  };

  const handleUpload = async (product: ProductCatalog) => {
    const file = uploads[product.id]?.manual;
    if (!file) {
      toast.error('No file selected', { description: 'Pick a User Manual file first.' });
      return;
    }

    setIsUploading(prev => ({ ...prev, [product.id]: true }));

    try {
      const targetName = docFileNameFor(file.name);
      const path = `${product.id}/${targetName}`;

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(path, file, {
          upsert: true,
          contentType: file.type || 'application/octet-stream',
        });

      if (error) {
        throw error;
      }

      const publicUrl = buildPublicUrl(path);

      await onUpdateProduct({
        ...product,
        manualUrl: publicUrl,
      });

      toast.success('User Manual uploaded', { description: product.name });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      toast.error('Upload failed', { description: message });
    } finally {
      setIsUploading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleTemplateUpload = async () => {
    if (!templateFile) {
      toast.error('No file selected', { description: 'Pick a template .docx file first.' });
      return;
    }

    setIsUploadingTemplate(true);
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(templatePath, templateFile, {
          upsert: true,
          contentType: templateFile.type || 'application/octet-stream',
        });

      if (error) {
        throw error;
      }

      toast.success('Template updated', { description: 'The global template has been replaced.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      toast.error('Template upload failed', { description: message });
    } finally {
      setIsUploadingTemplate(false);
    }
  };

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isEditing) return;

    const parsedOrder = displayOrder.trim() === '' ? null : Number(displayOrder);
    const normalizedOrder = Number.isFinite(parsedOrder) ? parsedOrder : null;

    if (!selectedProductId) {
      return;
    }

    if (editingFeature) {
      onUpdateFeature({
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
      onAddFeature(newFeature);
    }

    resetForm();
  };

  const handleDelete = (featureIdToDelete: string) => {
    if (confirm('Are you sure you want to delete this feature?')) {
      onDeleteFeature(featureIdToDelete);
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

  const handleProductSubmit = (event: React.FormEvent) => {
    event.preventDefault();
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
    <Card className="border border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="px-6 md:px-10 lg:px-12 pt-16 pb-6">
        <CardTitle className="text-4xl md:text-5xl lg:text-6xl text-white text-center w-full">Product Documents</CardTitle>
      </CardHeader>
      <CardContent className="px-6 md:px-10 lg:px-12 pb-8 pt-4">
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6 md:p-7 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg text-white font-semibold">Global Template</h3>
              <p className="text-sm text-white/60">
                Replaces the single template used for all generated manuals.
              </p>
            </div>
            <FileUp className="size-5 text-white/60" />
          </div>
          <div className="mt-4 flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-white/70" htmlFor="template-upload">
                        Upload .docx template
                      </Label>
                      <input
                        id="template-upload"
                        type="file"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setTemplateFile(file);
                          setTemplateFileName(file?.name || '');
                        }}
                      />
                      <label
                        htmlFor="template-upload"
                        className="mt-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/80 cursor-pointer hover:bg-white/15 transition"
                      >
                        <span>{templateFileName || 'Choose a .docx file'}</span>
                        <span className="text-white/50">Browse</span>
                      </label>
                    </div>
            <Button
              type="button"
              variant="outline"
              className="border border-white/15 bg-white/10 text-white hover:bg-white/15"
              onClick={handleTemplateUpload}
              disabled={isUploadingTemplate}
            >
              <FolderUp className="size-4 mr-2" />
              {isUploadingTemplate ? 'Uploading...' : 'Replace Template'}
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[680px] pr-4">
          <div className="space-y-6">
            {sortedProducts.map(product => (
              <div key={product.id} className="rounded-xl border border-white/10 bg-white/5 p-6 md:p-7 space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <h3 className="text-lg text-white font-semibold tracking-tight">{product.name}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{product.description}</p>
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs whitespace-nowrap ${product.manualUrl ? 'bg-emerald-500/15 text-emerald-200' : 'bg-white/10 text-white/50'}`}>
                    <FileText className="size-3.5" />
                    {product.manualUrl ? 'Manual linked' : 'Manual missing'}
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <UploadCloud className="size-4 text-white/60" />
                        <span>Upload or replace the manual for this product.</span>
                      </div>
                      <input
                        id={`${product.id}-manual`}
                        type="file"
                        className="sr-only"
                        onChange={(event) => handleFileChange(product.id, event.target.files?.[0] ?? null)}
                      />
                      <label
                        htmlFor={`${product.id}-manual`}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/80 cursor-pointer hover:bg-white/15 transition"
                      >
                        <span>{manualFileNames[product.id] || 'Choose a manual file'}</span>
                        <span className="text-white/50">Browse</span>
                      </label>
                    </div>
                    <div className="flex flex-col gap-2 lg:w-56">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full border border-white/15 bg-white/10 text-white hover:bg-white/15"
                        onClick={() => handleUpload(product)}
                        disabled={isUploading[product.id]}
                      >
                        <FolderUp className="size-4 mr-2" />
                        {isUploading[product.id] ? 'Uploading...' : 'Replace Manual'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-white/80 hover:text-white hover:bg-white/10"
                        onClick={() => {
                          if (!product.manualUrl) {
                            toast.error('No manual available', { description: 'Upload a manual first.' });
                            return;
                          }
                          window.open(product.manualUrl, '_blank');
                        }}
                      >
                        <Download className="size-4 mr-2" />
                        Download Manual
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6 md:p-7">
          <div className="flex flex-col gap-2 mb-6">
            <h3 className="text-xl text-white font-semibold">Manage Products & Features</h3>
            <p className="text-sm text-white/60">
              Edit product catalog entries and the feature sets tied to each product.
            </p>
          </div>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="bg-white/10 border border-white/10">
              <TabsTrigger value="products" className="text-white/80 data-[state=active]:bg-white data-[state=active]:!text-slate-900 data-[state=active]:font-semibold">
                Products
              </TabsTrigger>
              <TabsTrigger value="features" className="text-white/80 data-[state=active]:bg-white data-[state=active]:!text-slate-900 data-[state=active]:font-semibold">
                Features
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white/90">Catalog Entries</h4>
                  <Button
                    type="button"
                    size="sm"
                    className="border border-white/15 bg-white/10 text-white hover:bg-white/15"
                    onClick={() => {
                      resetProductForm();
                      setIsEditingProduct(true);
                    }}
                  >
                    <Plus className="size-4 mr-1" />
                    New
                  </Button>
                </div>
                <ScrollArea className="h-[420px] pr-4">
                  <div className="space-y-2">
                    {sortedProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          editingProduct?.id === product.id
                            ? 'border-white/30 bg-white/10'
                            : 'border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-white break-words">{product.name}</div>
                            <div className="text-white/60 text-sm break-words">{product.description}</div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-white/70 hover:text-white"
                              onClick={() => startProductEdit(product)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
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
                  <Label htmlFor="product-id" className="text-white/70">Product ID</Label>
                  <Input
                    id="product-id"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="auto-generated if blank"
                    disabled={isProductFormDisabled || !!editingProduct}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  {!editingProduct && (
                    <p className="text-xs text-white/50">
                      Leave blank to auto-generate from the product name.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-name" className="text-white/70">Product Name</Label>
                  <Input
                    id="product-name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    required
                    disabled={isProductFormDisabled}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-description" className="text-white/70">Description</Label>
                  <Textarea
                    id="product-description"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Describe the product"
                    required
                    disabled={isProductFormDisabled}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-manual" className="text-white/70">Manual URL</Label>
                  <Input
                    id="product-manual"
                    value={productManualUrl}
                    onChange={(e) => setProductManualUrl(e.target.value)}
                    placeholder="https://..."
                    disabled={isProductFormDisabled}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-order" className="text-white/70">Display Order</Label>
                  <Input
                    id="product-order"
                    type="number"
                    value={productOrder}
                    onChange={(e) => setProductOrder(e.target.value)}
                    placeholder="Optional"
                    disabled={isProductFormDisabled}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="mt-auto flex gap-2">
                  <Button type="button" variant="outline" className="border border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={resetProductForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="border border-white/20 bg-white/15 text-white hover:bg-white/25" disabled={isProductFormDisabled}>
                    {editingProduct ? 'Update' : 'Add'} Product
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="features" className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white/90">Feature Entries</h4>
                  <Button
                    type="button"
                    size="sm"
                    className="border border-white/15 bg-white/10 text-white hover:bg-white/15"
                    onClick={() => {
                      resetForm();
                      setIsEditing(true);
                    }}
                  >
                    <Plus className="size-4 mr-1" />
                    New
                  </Button>
                </div>
                <ScrollArea className="h-[420px] pr-4">
                  <div className="space-y-2">
                    {sortedFeatures.map((feature) => {
                      const productNameForFeature = products.find((product) => product.id === feature.productId)?.name || 'Unknown';
                      return (
                        <div
                          key={feature.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            editingFeature?.id === feature.id
                              ? 'border-white/30 bg-white/10'
                              : 'border-white/10 hover:border-white/25'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-white break-words">{feature.name}</div>
                              <div className="text-white/60 text-sm break-words">{feature.description}</div>
                              <div className="text-white/40 text-xs mt-1 break-words">{productNameForFeature}</div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-white/70 hover:text-white"
                                onClick={() => startEdit(feature)}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
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
                  <Label htmlFor="feature-id" className="text-white/70">Feature ID</Label>
                  <Input
                    id="feature-id"
                    value={featureId}
                    onChange={(e) => setFeatureId(e.target.value)}
                    placeholder="auto-generated if blank"
                    disabled={isFormDisabled || !!editingFeature}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  {!editingFeature && (
                    <p className="text-xs text-white/50">
                      Leave blank to auto-generate from the feature name.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Product</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={isFormDisabled}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
                  <Label htmlFor="feature-name" className="text-white/70">Feature Name</Label>
                  <Input
                    id="feature-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter feature name"
                    required
                    disabled={isFormDisabled}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feature-description" className="text-white/70">Description</Label>
                  <Textarea
                    id="feature-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the feature"
                    required
                    disabled={isFormDisabled}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feature-order" className="text-white/70">Display Order</Label>
                  <Input
                    id="feature-order"
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    placeholder="Optional"
                    disabled={isFormDisabled}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="mt-auto flex gap-2">
                  <Button type="button" variant="outline" className="border border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="border border-white/20 bg-white/15 text-white hover:bg-white/25" disabled={isFormDisabled}>
                    {editingFeature ? 'Update' : 'Add'} Feature
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}

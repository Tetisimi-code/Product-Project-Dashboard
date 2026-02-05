import { ProductCatalog, ProductFeature, Project } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { FileText, Copy, Check, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import * as api from '../utils/api';

interface ProjectDocumentationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  products: ProductCatalog[];
  features: ProductFeature[];
}

export function ProjectDocumentationPanel({
  open,
  onOpenChange,
  project,
  products,
  features,
}: ProjectDocumentationPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const usedFeatures = features.filter(f => project.featuresUsed.includes(f.id));
  const deployedFeatureIds = new Set(project.deployedFeatures);
  const deployedCount = usedFeatures.filter(feature => deployedFeatureIds.has(feature.id)).length;
  const totalCount = usedFeatures.length;
  const canGenerate = totalCount > 0;
  const productNameById = new Map(products.map(product => [product.id, product.name]));
  const enabledProducts = Array.from(new Set(usedFeatures.map(feature => feature.productId)))
    .map(productId => productNameById.get(productId))
    .filter((name): name is string => Boolean(name));
  const enabledProductDetails = Array.from(new Set(usedFeatures.map(feature => feature.productId)))
    .map(productId => products.find(product => product.id === productId))
    .filter((product): product is ProductCatalog => Boolean(product));

  const documentationText = `Project User Manual

Enabled Products:
${enabledProducts.length > 0 ? enabledProducts.map(name => `✓ ${name}`).join('\n') : 'None'}

Status:
${deployedCount} / ${totalCount} features deployed

Actions:
[ Generate User Manual ]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(documentationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateManual = async () => {
    if (!canGenerate) {
      toast.error('No product features enabled', {
        description: 'Add product features to this project before generating a manual.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const manualTimeoutMs = 4000;
      const manualTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Manual generation timed out')), manualTimeoutMs);
      });

      const idempotencyKey = `${project.id}:${usedFeatures.map(feature => feature.id).join(',')}`;
      const startResult = await Promise.race([
        api.generateUserManual(project.id, idempotencyKey),
        manualTimeout,
      ]);
      if (startResult.error || !startResult.data?.jobId) {
        throw new Error(startResult.error || 'Manual generation failed');
      }

      const jobId = startResult.data.jobId;
      const maxAttempts = 30;
      const pollDelayMs = 2000;
      let attempt = 0;
      let jobStatus = 'pending';
      let downloadUrl = '';

      while (attempt < maxAttempts) {
        const jobResult = await api.getDocumentationJob(jobId);
        if (jobResult.error) {
          throw new Error(jobResult.error);
        }
        const job = jobResult.data?.job;
        if (!job) {
          throw new Error('Job status unavailable');
        }

        jobStatus = job.status;
        if (jobStatus === 'completed') {
          downloadUrl = job.downloadUrl;
          break;
        }
        if (jobStatus === 'failed') {
          throw new Error(job.error || 'Manual generation failed');
        }

        attempt += 1;
        await new Promise(resolve => setTimeout(resolve, pollDelayMs));
      }

      if (!downloadUrl) {
        throw new Error('Manual generation timed out');
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Download link unavailable');
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `${project.name.replace(/[^a-z0-9-_]+/gi, '-')}-user-manual.docx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);

      toast.success('User manual downloaded', { description: project.name });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate manual';
      const fallbackManuals = enabledProductDetails.filter(product => product.manualUrl);
      if (fallbackManuals.length > 0) {
        toast.error('Generate User Manual failed', {
          description: `${message}. Downloading individual manuals instead.`,
        });

        for (const product of fallbackManuals) {
          if (!product.manualUrl) continue;
          try {
            const response = await fetch(product.manualUrl);
            if (!response.ok) continue;
            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = objectUrl;
            anchor.download = `${product.name.replace(/[^a-z0-9-_]+/gi, '-')}-manual.docx`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(objectUrl);
          } catch {
            // Ignore per-product download errors
          }
        }
      } else {
        toast.error('Generate User Manual failed', {
          description: message,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-purple-600" />
            Project User Manual
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative">
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-400"
              >
                {copied ? (
                  <>
                    <Check className="size-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="bg-slate-900 p-6 rounded-lg font-mono text-sm space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-white">{project.name}</h3>
              </div>

              <div>
                <div className="text-slate-500 mb-2">Enabled Products:</div>
                <div className="space-y-1 pl-2">
                  {enabledProducts.length > 0 ? (
                    enabledProducts.map(productName => (
                      <div key={productName} className="flex items-start gap-2">
                        <span style={{ color: '#4ade80' }}>✓</span>
                        <span className="text-white">{productName}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-white">None</div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-slate-500 mb-2">Status:</div>
                <div className="pl-2 text-white">
                  {deployedCount} / {totalCount} features deployed
                </div>
              </div>

              <div>
                <div className="text-slate-500 mb-2">Actions:</div>
                <div className="space-y-1 pl-2">
                  <div className="text-white">[ Generate User Manual ]</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              className="w-full justify-start gap-2 h-auto py-4"
              variant="outline"
              onClick={handleGenerateManual}
              disabled={isGenerating || !canGenerate}
            >
              <BookOpen className="size-5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">
                  {isGenerating ? 'Generating User Manual...' : 'Generate User Manual'}
                </span>
                <span className="text-sm text-slate-500 font-normal">
                  {canGenerate
                    ? 'Auto-generate documentation based on enabled features'
                    : 'Add product features to enable manual generation'}
                </span>
              </div>
            </Button>
          </div>

          
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { ProductFeature, Project } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { FileText, Copy, Check, FileUp, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import * as api from '../utils/api';

interface ProjectDocumentationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  features: ProductFeature[];
}

export function ProjectDocumentationPanel({
  open,
  onOpenChange,
  project,
  features,
}: ProjectDocumentationPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const usedFeatures = features.filter(f => project.featuresUsed.includes(f.id));
  const deployedCount = project.deployedFeatures.length;
  const totalCount = project.featuresUsed.length;

  const documentationText = `Project Documentation

Enabled Products:
${usedFeatures.map(f => `✓ ${f.name}`).join('\n')}

Status:
${deployedCount} / ${totalCount} features deployed

Actions:
[ Generate User Manual ]
[ Upload Supporting Docs ] (optional)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(documentationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateManual = async () => {
    setIsGenerating(true);
    try {
      const idempotencyKey = `${project.id}:${project.featuresUsed.join(',')}`;
      const startResult = await api.generateUserManual(project.id, idempotencyKey);
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
      toast.error('Generate User Manual failed', {
        description: message,
      });
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
            Project Documentation
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
                  {usedFeatures.map(feature => (
                    <div key={feature.id} className="flex items-start gap-2">
                      <span style={{ color: '#4ade80' }}>✓</span>
                      <span className="text-white">{feature.name}</span>
                    </div>
                  ))}
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
                  <div className="text-white">[ Upload Supporting Docs ] <span className="text-slate-500">(optional)</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              className="w-full justify-start gap-2 h-auto py-4"
              variant="outline"
              onClick={handleGenerateManual}
              disabled={isGenerating}
            >
              <BookOpen className="size-5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">
                  {isGenerating ? 'Generating User Manual...' : 'Generate User Manual'}
                </span>
                <span className="text-sm text-slate-500 font-normal">
                  Auto-generate documentation based on enabled features
                </span>
              </div>
            </Button>

            <Button
              className="w-full justify-start gap-2 h-auto py-4"
              variant="outline"
            >
              <FileUp className="size-5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">Upload Supporting Docs</span>
                <span className="text-sm text-slate-500 font-normal">
                  Add additional documentation files (optional)
                </span>
              </div>
            </Button>
          </div>

          
        </div>
      </DialogContent>
    </Dialog>
  );
}

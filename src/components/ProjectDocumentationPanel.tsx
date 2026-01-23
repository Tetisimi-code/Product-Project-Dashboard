import { ProductFeature, Project } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { FileText, Copy, Check, FileUp, BookOpen } from 'lucide-react';
import { useState } from 'react';

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
                className="flex items-center gap-1 text-slate-400 hover:text-slate-300"
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

            <div className="bg-slate-900 text-slate-100 p-6 rounded-lg font-mono text-sm space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">{project.name}</h3>
              </div>

              <div>
                <div className="text-slate-400 mb-2">Enabled Products:</div>
                <div className="space-y-1 pl-2">
                  {usedFeatures.map(feature => (
                    <div key={feature.id} className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-slate-400 mb-2">Status:</div>
                <div className="pl-2">
                  {deployedCount} / {totalCount} features deployed
                </div>
              </div>

              <div>
                <div className="text-slate-400 mb-2">Actions:</div>
                <div className="space-y-1 pl-2">
                  <div className="text-slate-300">[ Generate User Manual ]</div>
                  <div className="text-slate-300">[ Upload Supporting Docs ] <span className="text-slate-500">(optional)</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              className="w-full justify-start gap-2 h-auto py-4"
              variant="outline"
            >
              <BookOpen className="size-5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">Generate User Manual</span>
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

          {(project as any).documentationUrl && (
            <div className="pt-4 border-t">
              <div className="text-sm text-slate-600 mb-2">External Documentation:</div>
              <a
                href={(project as any).documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline text-sm break-all"
              >
                {(project as any).documentationUrl}
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FileText, ExternalLink, Trash2 } from 'lucide-react';

interface DocumentationLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  currentDocUrl?: string;
  onLink: (docUrl: string) => void;
  onRemove?: () => void;
}

export function DocumentationLinkDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  currentDocUrl,
  onLink,
  onRemove,
}: DocumentationLinkDialogProps) {
  const [docUrl, setDocUrl] = useState(currentDocUrl || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setDocUrl(currentDocUrl || '');
      setError('');
    }
  }, [open, currentDocUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!docUrl.trim()) {
      setError('Please enter a documentation URL');
      return;
    }

    try {
      new URL(docUrl);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    onLink(docUrl.trim());
    onOpenChange(false);
  };

  const handleRemove = () => {
    if (onRemove && confirm('Are you sure you want to remove the documentation link?')) {
      onRemove();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-purple-600" />
            {currentDocUrl ? 'Edit Documentation Link' : 'Add Documentation Link'}
          </DialogTitle>
          <DialogDescription>
            {currentDocUrl 
              ? `Update the documentation link for "${projectName}"`
              : `Add a documentation link for "${projectName}"`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc-url">Documentation URL</Label>
            <Input
              id="doc-url"
              type="url"
              placeholder="https://docs.example.com/project-name"
              value={docUrl}
              onChange={(e) => {
                setDocUrl(e.target.value);
                setError('');
              }}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <p className="text-sm text-slate-500">
              Enter the URL to your project documentation (e.g., Confluence, Notion, Google Docs, etc.)
            </p>
          </div>

          {currentDocUrl && (
            <div className="p-3 bg-slate-50 rounded-md border">
              <p className="text-sm text-slate-600 mb-2">Current link:</p>
              <a 
                href={currentDocUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="size-3" />
                {currentDocUrl}
              </a>
            </div>
          )}

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div>
                {currentDocUrl && onRemove && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleRemove}
                    size="sm"
                  >
                    <Trash2 className="size-4 mr-1" />
                    Remove Link
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {currentDocUrl ? 'Update Link' : 'Add Link'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

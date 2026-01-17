import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { ExternalLink, AlertCircle } from 'lucide-react';

interface ResendKeyInstructionsProps {
  onShowFullGuide?: () => void;
}

export function ResendKeyInstructions({ onShowFullGuide }: ResendKeyInstructionsProps) {
  return (
    <Alert className="mb-4 border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-900">Email Service Configuration Required</AlertTitle>
      <AlertDescription className="space-y-3 text-red-800">
        <p className="text-sm">
          <strong>Note:</strong> Resend free tier only sends to your own email. For testing, use the same email as your Resend account. 
          For production, verify a domain.
        </p>
        <p className="text-sm">
          Follow these steps to configure Resend:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
          <li>
            <a 
              href="https://resend.com/signup" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-violet-700 hover:underline font-medium"
            >
              Sign up for a free Resend account
            </a> (if you don't have one)
          </li>
          <li>
            In your Resend dashboard, click <strong>"API Keys"</strong>
          </li>
          <li>
            Click <strong>"Create API Key"</strong> and copy it (starts with <code className="bg-red-100 px-1 rounded text-xs">re_</code>)
          </li>
          <li>
            Open your{' '}
            <a 
              href="https://supabase.com/dashboard/project/_/settings/functions" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-violet-700 hover:underline font-medium"
            >
              Supabase Functions Settings
            </a>
          </li>
          <li>
            Find <code className="bg-red-100 px-1 rounded text-xs">RESEND_API_KEY</code> and update it with your new key
          </li>
          <li>
            Wait 30 seconds for the changes to take effect, then try signing up again
          </li>
        </ol>
        <div className="pt-2 flex gap-2 flex-wrap">
          {onShowFullGuide && (
            <Button
              variant="default"
              size="sm"
              className="text-xs"
              onClick={onShowFullGuide}
            >
              View Full Setup Guide
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => window.open('https://resend.com/signup', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Get Resend API Key
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => window.open('https://supabase.com/dashboard/project/_/settings/functions', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Supabase Settings
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

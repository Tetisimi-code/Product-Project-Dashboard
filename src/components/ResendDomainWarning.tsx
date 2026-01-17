import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { ExternalLink, AlertTriangle } from 'lucide-react';

interface ResendDomainWarningProps {
  userEmail: string;
  resendEmail?: string;
}

export function ResendDomainWarning({ userEmail, resendEmail }: ResendDomainWarningProps) {
  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">Domain Verification Required</AlertTitle>
      <AlertDescription className="space-y-3 text-amber-800">
        <p className="text-sm">
          <strong>Resend Free Tier Limitation:</strong> You can only send emails to your own verified email address.
        </p>
        
        <div className="bg-white/50 border border-amber-300 rounded-lg p-3 space-y-2">
          <p className="text-sm">
            <strong>Quick Fix for Testing:</strong>
          </p>
          <p className="text-xs">
            {resendEmail ? (
              <>
                Sign up using <span className="bg-amber-100 px-2 py-0.5 rounded font-mono">{resendEmail}</span> instead of <strong>{userEmail}</strong>
              </>
            ) : (
              <>Sign up using the same email as your Resend account instead of <strong>{userEmail}</strong></>
            )}
          </p>
        </div>

        <div className="bg-white/50 border border-amber-300 rounded-lg p-3 space-y-2">
          <p className="text-sm">
            <strong>Production Solution:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-xs ml-2">
            <li>Verify a domain in Resend (e.g., reactive-technologies.com)</li>
            <li>Update DNS records at your domain provider</li>
            <li>Wait for verification (5-15 minutes)</li>
            <li>Update the server code to use your domain</li>
          </ol>
        </div>

        <div className="pt-2 flex gap-2 flex-wrap">
          <Button
            variant="default"
            size="sm"
            className="text-xs"
            onClick={() => window.open('https://resend.com/domains', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Verify Domain in Resend
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => window.open('https://resend.com/docs/send-with-nextjs', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Documentation
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

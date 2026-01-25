import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, ExternalLink, Loader2, Copy, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function SetupGuide() {
  const [isChecking, setIsChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const health = await response.json();
      setHealthStatus(health);
      
      if (!health.environment?.hasResendKey) {
        toast.error('RESEND_API_KEY not configured');
      } else if (health.environment.resendKeyLength < 20) {
        toast.error('RESEND_API_KEY appears invalid (too short)');
      } else {
        toast.success('Server configuration looks good!');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error('Health check failed', { description: String(error) });
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Email Service Setup Guide</CardTitle>
        <CardDescription>
          Follow these steps to configure email verification for your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1 */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-sm font-semibold">
              1
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold">Get a Resend API Key</h3>
              <p className="text-sm text-gray-600">
                Resend is a free email service. You'll need an API key to send verification emails.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://resend.com/signup', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Sign up for Resend (Free)
              </Button>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-sm font-semibold">
              2
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold">Create an API Key in Resend</h3>
              <ol className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
                <li>Log into your Resend dashboard</li>
                <li>Click "API Keys" in the sidebar</li>
                <li>Click "Create API Key"</li>
                <li>Give it a name (e.g., "Product Management App")</li>
                <li>Copy the key (starts with <code className="bg-gray-100 px-1 rounded text-xs">re_</code>)</li>
              </ol>
              <Alert className="bg-amber-50 border-amber-200">
                <AlertDescription className="text-sm text-amber-900">
                  ⚠️ <strong>Important:</strong> Copy the API key immediately - you won't be able to see it again!
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-sm font-semibold">
              3
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold">Update Supabase Environment Variable</h3>
              <ol className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to Settings → Edge Functions</li>
                <li>Find the <code className="bg-gray-100 px-1 rounded text-xs">RESEND_API_KEY</code> variable</li>
                <li>Click "Edit" and paste your Resend API key</li>
                <li>Click "Save" or "Update"</li>
              </ol>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://supabase.com/dashboard/project/_/settings/functions', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Supabase Settings
                </Button>
              </div>
              <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
                <p className="text-xs text-gray-600">Variable name to update:</p>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-3 py-1 rounded border text-sm flex-1">
                    RESEND_API_KEY
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard('RESEND_API_KEY')}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-sm font-semibold">
              4
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold">Verify Configuration</h3>
              <p className="text-sm text-gray-600">
                Wait 30-60 seconds for the changes to take effect, then click the button below to verify.
              </p>
              <Button
                onClick={checkHealth}
                disabled={isChecking}
                variant="default"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Server Status'
                )}
              </Button>
              
              {healthStatus && (
                <div className="mt-3 p-3 bg-gray-50 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    {healthStatus.environment?.hasResendKey ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm font-semibold">
                      {healthStatus.environment?.hasResendKey ? 'API Key Found' : 'API Key Missing'}
                    </span>
                  </div>
                  {healthStatus.environment?.hasResendKey && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Key prefix: <code className="bg-white px-1 rounded">{healthStatus.environment.resendKeyPrefix}...</code></p>
                      <p>Key length: {healthStatus.environment.resendKeyLength} characters</p>
                      {healthStatus.environment.resendKeyLength < 20 && (
                        <Alert className="bg-red-50 border-red-200 mt-2">
                          <AlertDescription className="text-xs text-red-900">
                            ⚠️ Warning: API key seems too short. Valid Resend keys are typically 50+ characters.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Domain Verification (Optional but Recommended) */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-sm font-semibold">
              5
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold">Domain Verification (Optional for Testing)</h3>
              <Alert className="bg-amber-50 border-amber-200">
                <AlertDescription className="text-sm text-amber-900">
                  <strong>⚠️ Important:</strong> Resend's free tier only allows sending emails to your own verified email address. 
                  To send to other users (e.g., @reactive-technologies.com emails), you must verify a domain.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-gray-600">
                <strong>For testing:</strong> You can sign up using the same email address as your Resend account ({healthStatus?.environment?.resendEmail || 'your Resend email'}).
              </p>
              <p className="text-sm text-gray-600">
                <strong>For production:</strong> Verify a domain in Resend to send to any email address.
              </p>
              <ol className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
                <li>In Resend dashboard, click "Domains"</li>
                <li>Click "Add Domain" and enter your domain</li>
                <li>Add the DNS records shown to your domain provider</li>
                <li>Wait for verification (usually a few minutes)</li>
                <li>Update the server code to use your domain email</li>
              </ol>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://resend.com/domains', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Domains in Resend
              </Button>
            </div>
          </div>
        </div>

        {/* Final Step */}
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-900">
            <strong>Quick Start:</strong> For testing, sign up using the same email as your Resend account. 
            For production use with multiple users, verify a domain first.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

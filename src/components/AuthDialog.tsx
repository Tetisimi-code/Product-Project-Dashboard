import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// NOTE: Email verification and domain restrictions have been disabled
// Users can sign up with any email address without verification

interface AuthDialogProps {
  open: boolean;
  onAuthSuccess: (user: any, token: string) => void;
}

export function AuthDialog({ open, onAuthSuccess }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        toast.error('Login failed', { description: error.message });
        setIsLoading(false);
        return;
      }

      if (data.session) {
        const user = data.user;
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        
        toast.success('Welcome back!', { description: `Logged in as ${userName}` });
        onAuthSuccess(user, data.session.access_token);
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast.error('Login failed', { description: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setIsLoading(true);

    try {
      // Call the server to create the user
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: signupEmail,
            password: signupPassword,
            name: signupName,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('Signup error response:', result);
        toast.error('Signup failed', { description: result.error || 'An error occurred during signup' });
        setIsLoading(false);
        return;
      }

      // Account created successfully, now log in
      console.log('Signup successful, logging in...');
      toast.success('Account created!', { 
        description: 'Logging you in...' 
      });
      
      // Auto-login after successful signup
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signupEmail,
        password: signupPassword,
      });

      if (error) {
        toast.error('Login failed', { description: 'Please log in manually' });
        setIsLoading(false);
        return;
      }

      if (data.session) {
        const userName = data.user.user_metadata?.name || signupName || 'User';
        toast.success('Welcome!', { description: `Logged in as ${userName}` });
        onAuthSuccess(data.user, data.session.access_token);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Signup exception:', error);
      toast.error('Signup failed', { description: 'An unexpected error occurred' });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
        redirectTo: `${window.location.origin}?reset-password=true`,
      });

      if (error) {
        toast.error('Password reset failed', { description: error.message });
        setIsLoading(false);
        return;
      }

      toast.success('Password reset email sent', { 
        description: 'Check your email for the reset link' 
      });
      setShowForgotPassword(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Password reset exception:', error);
      toast.error('Password reset failed', { description: 'An unexpected error occurred' });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Reactive Technologies</DialogTitle>
          <DialogDescription>
            Sign in to access your team's product-project management board
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            {!showForgotPassword ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                  <p className="text-sm text-slate-600">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={isLoading}
                  >
                    Back to Login
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    setEmailError('');
                  }}
                  required
                  className={emailError ? 'border-red-500' : ''}
                />
                {emailError && (
                  <p className="text-sm text-red-600">{emailError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
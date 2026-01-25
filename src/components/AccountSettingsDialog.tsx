import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Configuration: Allowed email domains (must match server configuration)
const ALLOWED_EMAIL_DOMAINS = [
  'reactive-technologies.com',
];

// Helper function to validate email domain
function isEmailAllowed(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.some(allowedDomain => 
    domain === allowedDomain.toLowerCase()
  );
}

interface AccountSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: any;
  onProfileUpdate: (updatedUser: any) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

// Helper to get fresh access token
async function getFreshToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

export function AccountSettingsDialog({ 
  open, 
  onOpenChange, 
  currentUser, 
  onProfileUpdate,
  isAdmin,
  onLogout
}: AccountSettingsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load user data when dialog opens
  useEffect(() => {
    if (open && currentUser) {
      setName(currentUser.user_metadata?.name || '');
      setEmail(currentUser.email || '');
      setNewEmail('');
      setIsEditingEmail(false);
      setEmailError('');
    }
  }, [open, currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update user metadata (name)
      const { data, error } = await supabase.auth.updateUser({
        data: { name }
      });

      if (error) {
        toast.error('Profile update failed', { description: error.message });
        setIsLoading(false);
        return;
      }

      // Also update on the server
      const token = await getFreshToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/update-profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        console.warn('Server profile update failed, but local update succeeded');
      }

      toast.success('Profile updated!', { description: 'Your profile has been updated successfully.' });
      
      // Update the parent component with new user data
      if (data.user) {
        onProfileUpdate(data.user);
      }
    } catch (error) {
      console.error('Profile update exception:', error);
      toast.error('Profile update failed', { description: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    
    // Validate email domain
    if (!isEmailAllowed(newEmail)) {
      setEmailError('Only reactive-technologies.com email addresses are allowed');
      return;
    }

    if (newEmail === email) {
      setEmailError('New email must be different from current email');
      return;
    }

    setIsLoading(true);

    try {
      // Call the server to update email (admin only)
      const token = await getFreshToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/update-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ newEmail }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error('Email update failed', { description: result.error });
        setIsLoading(false);
        return;
      }

      toast.success('Email updated successfully!', { 
        description: 'Please log in again with your new email address.' 
      });
      
      // Close dialog and log out
      onOpenChange(false);
      setTimeout(() => {
        onLogout();
      }, 1500);
    } catch (error) {
      console.error('Email update exception:', error);
      toast.error('Email update failed', { description: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match', { description: 'Please make sure your new passwords match.' });
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password too short', { description: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsLoading(true);

    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error('Current password is incorrect', { description: 'Please check your current password and try again.' });
        setIsLoading(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error('Password update failed', { description: error.message });
        setIsLoading(false);
        return;
      }

      toast.success('Password updated!', { description: 'Your password has been changed successfully.' });
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password update exception:', error);
      toast.error('Password update failed', { description: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage your account information and security settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Information */}
          <div>
            <h3 className="mb-4">Profile Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </div>

          <Separator />

          {/* Email Change (Admin Only) */}
          {isAdmin && (
            <>
              <div>
                <h3 className="mb-4">Change Email Address</h3>
                {!isEditingEmail ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Email</Label>
                      <Input
                        type="email"
                        value={email}
                        disabled
                        className="bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                    <Button 
                      onClick={() => setIsEditingEmail(true)}
                      variant="outline"
                      type="button"
                    >
                      Change Email Address
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateEmail} className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-900">
                        <strong>Warning:</strong> Changing your email will log you out. You'll need to sign in again with your new email address.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Current Email</Label>
                      <Input
                        type="email"
                        value={email}
                        disabled
                        className="bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-email">New Email Address</Label>
                      <Input
                        id="new-email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => {
                          setNewEmail(e.target.value);
                          setEmailError('');
                        }}
                        placeholder="new.email@reactive-technologies.com"
                        required
                        className={emailError ? 'border-red-500' : ''}
                      />
                      {emailError && (
                        <p className="text-sm text-red-600">{emailError}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Must be a @reactive-technologies.com email address
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Updating...' : 'Update Email'}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingEmail(false);
                          setNewEmail('');
                          setEmailError('');
                        }}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              <Separator />
            </>
          )}

          {/* Password Change */}

          {/* Password Change */}
          <div>
            <h3 className="mb-4">Change Password</h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>

          <Separator />

          {/* Account Information */}
          <div>
            <h3 className="mb-3">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">User ID:</span>
                <span className="font-mono text-xs">{currentUser?.id?.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Created:</span>
                <span>{new Date(currentUser?.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

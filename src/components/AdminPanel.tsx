import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2, RefreshCw, Shield, AlertCircle, ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as api from '../utils/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastSignIn: string;
  isAdmin?: boolean;
}

interface AdminPanelProps {
  currentUserId: string;
}

export function AdminPanel({ currentUserId }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [userToPromote, setUserToPromote] = useState<User | null>(null);
  const [userToDemote, setUserToDemote] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const result = await api.listUsers();
    
    if (result.error) {
      toast.error('Failed to load users', { description: result.error });
    } else if (result.data) {
      setUsers(result.data.users);
    }
    
    setIsLoading(false);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const result = await api.deleteUser(userToDelete.id);
    
    if (result.error) {
      toast.error('Failed to delete user', { description: result.error });
    } else {
      toast.success('User deleted', { description: `${userToDelete.email} has been removed` });
      setUsers(users.filter(u => u.id !== userToDelete.id));
    }
    
    setUserToDelete(null);
  };

  const handleDeleteAllUsers = async () => {
    setIsLoading(true);
    const result = await api.deleteAllUsers();
    
    if (result.error) {
      toast.error('Failed to delete all users', { description: result.error });
    } else if (result.data) {
      toast.success('All users deleted', { 
        description: `${result.data.deletedCount} users have been removed` 
      });
      setUsers([]);
    }
    
    setShowDeleteAllConfirm(false);
    setIsLoading(false);
  };

  const handlePromoteUser = async () => {
    if (!userToPromote) return;

    const result = await api.makeUserAdmin(userToPromote.id);
    
    if (result.error) {
      toast.error('Failed to promote user', { description: result.error });
    } else {
      toast.success('User promoted', { description: `${userToPromote.email} is now an admin` });
      setUsers(users.map(u => u.id === userToPromote.id ? { ...u, isAdmin: true } : u));
    }
    
    setUserToPromote(null);
  };

  const handleDemoteUser = async () => {
    if (!userToDemote) return;

    const result = await api.removeUserAdmin(userToDemote.id);
    
    if (result.error) {
      toast.error('Failed to demote user', { description: result.error });
    } else {
      toast.success('User demoted', { description: `${userToDemote.email} is no longer an admin` });
      setUsers(users.map(u => u.id === userToDemote.id ? { ...u, isAdmin: false } : u));
    }
    
    setUserToDemote(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-yellow-400" />
              <CardTitle className="text-white">Admin Control Panel</CardTitle>
            </div>
            <Button
              onClick={loadUsers}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <RefreshCw className={`size-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <CardDescription className="text-indigo-200">
            Manage team members and user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="size-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-200 text-sm">
                <strong>Admin Control Panel:</strong> You have administrator privileges for user management. 
                Deleting a user is permanent and cannot be undone. Admin users cannot be deleted through this panel for security.
              </p>
            </div>
          </div>

          {isLoading && users.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              No users found
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const isCurrentUser = user.id === currentUserId;
                
                return (
                  <div
                    key={user.id}
                    className={`bg-white/5 border rounded-lg p-4 flex items-center justify-between ${
                      isCurrentUser ? 'border-indigo-400/50' : 'border-white/10'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white">
                          {user.name}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                            You
                          </span>
                        )}
                        {user.isAdmin && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded flex items-center gap-1">
                            <Shield className="size-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-indigo-200 mb-2">{user.email}</p>
                      <div className="flex gap-4 text-xs text-white/50">
                        <span>Joined: {formatDate(user.createdAt)}</span>
                        <span>Last login: {formatDate(user.lastSignIn)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!user.isAdmin && (
                        <Button
                          onClick={() => setUserToPromote(user)}
                          disabled={isCurrentUser}
                          variant="outline"
                          size="sm"
                          className={`bg-white/10 text-white border-white/20 hover:bg-white/20 ${isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isCurrentUser ? 'Cannot promote your own account' : 'Promote to admin'}
                        >
                          <ShieldCheck className="size-4 mr-2" />
                          Make Admin
                        </Button>
                      )}
                      {user.isAdmin && !isCurrentUser && (
                        <Button
                          onClick={() => setUserToDemote(user)}
                          variant="outline"
                          size="sm"
                          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                          title="Remove admin privileges"
                        >
                          <ShieldOff className="size-4 mr-2" />
                          Remove Admin
                        </Button>
                      )}
                      <Button
                        onClick={() => setUserToDelete(user)}
                        disabled={isCurrentUser || user.isAdmin}
                        variant="destructive"
                        size="sm"
                        className={(isCurrentUser || user.isAdmin) ? 'opacity-50 cursor-not-allowed' : ''}
                        title={user.isAdmin && !isCurrentUser ? 'Cannot delete admin users' : isCurrentUser ? 'Cannot delete your own account' : 'Delete user'}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">
                <strong className="text-white">Total Users:</strong> {users.length}
              </p>
              <p className="text-sm text-white/60">
                <strong className="text-white">Admins:</strong> {users.filter(u => u.isAdmin).length}
              </p>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="size-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-200 text-sm mb-1">
                    <strong>Danger Zone:</strong> Delete all user accounts
                  </p>
                  <p className="text-red-200/70 text-xs">
                    This will permanently delete ALL users including yourself. This is useful for testing or resetting the application.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowDeleteAllConfirm(true)}
                variant="destructive"
                size="sm"
                disabled={users.length === 0}
                className="w-full"
              >
                <Trash2 className="size-4 mr-2" />
                Delete All Users ({users.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.email}</strong>?
              This action cannot be undone and will permanently remove this user's account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="size-5" />
              Delete All Users?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>
                  <strong className="text-red-600">WARNING:</strong> This will permanently delete all {users.length} user accounts, including your own account.
                </p>
                <p>
                  You will be immediately logged out and all user data will be lost. This action cannot be undone.
                </p>
                <p className="text-sm">
                  This is primarily for testing and development purposes. Are you absolutely sure?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAllUsers} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Yes, Delete All Users'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!userToPromote} onOpenChange={(open) => !open && setUserToPromote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to promote <strong>{userToPromote?.email}</strong> to admin?
              This action cannot be undone and will give this user admin privileges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePromoteUser} className="bg-green-600 hover:bg-green-700">
              Promote User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!userToDemote} onOpenChange={(open) => !open && setUserToDemote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Demote User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to demote <strong>{userToDemote?.email}</strong> from admin?
              This action cannot be undone and will remove this user's admin privileges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDemoteUser} className="bg-red-600 hover:bg-red-700">
              Demote User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
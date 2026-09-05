import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Trash2, Mail, Calendar, Loader2 } from 'lucide-react';

interface MongoDBUser extends User {
  _id?: string;
}

const Users = () => {
  const [users, setUsers] = useState<MongoDBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { isAdmin, user: currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [isAdmin, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await api.getUsers();
      setUsers(usersData);
    } catch (error: any) {
      toast({
        title: 'Failed to load users',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    console.log('Deleting user with ID:', id); 

    try {
      setDeleting(id);
      await api.deleteUser(id);
      toast({ 
        title: 'User deleted successfully',
        description: 'The user has been removed from the system'
      });
      await loadUsers(); 
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const getUserId = (user: MongoDBUser): string => {
    return user.id || user._id || '';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Users</h1>
          <div className="text-sm text-muted-foreground">
            Total Users: {users.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => {
            const userId = getUserId(user);
            const currentUserId = currentUser?.id || (currentUser as any)?._id;
            
            return (
              <Card key={userId} className="p-6 animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{user.username}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
                
                {user.role !== 'admin' && userId !== currentUserId && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(userId)}
                    disabled={deleting === userId}
                    className="w-full gap-2"
                  >
                    {deleting === userId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {deleting === userId ? 'Deleting...' : 'Delete User'}
                  </Button>
                )}
                
                {(user.role === 'admin' || userId === currentUserId) && (
                  <div className="text-xs text-muted-foreground text-center p-2 bg-muted rounded">
                    {userId === currentUserId 
                      ? 'This is your account' 
                      : 'Admin accounts cannot be deleted'
                    }
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Users;
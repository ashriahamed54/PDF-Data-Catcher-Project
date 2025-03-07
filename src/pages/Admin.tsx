
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  UserCog, 
  Users, 
  CreditCard, 
  LogOut, 
  Mail, 
  Lock, 
  Save,
  BadgeDollarSign,
  Trash,
  CheckCircle,
  XCircle,
  RefreshCcw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getRecentEntries } from "@/services/tableService";
import { getUsers, updateUserStatus, deleteUserAccount } from "@/services/userService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Admin = () => {
  const { user, isAdmin, logout, updateAdminEmail, updateAdminPassword } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Get all users
  const { data: users = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: !!isAdmin,
  });

  // Mutations for user management
  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string, status: 'active' | 'inactive' }) => 
      updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUserAccount(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  });

  // Get all payments
  const { data: payments = [], isLoading: isLoadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      // In a real application, you would fetch payments from your payment provider
      // For now, we'll return a mock list
      return [
        { 
          id: 'pay_1', 
          user: 'user1@example.com', 
          amount: '$19.99', 
          status: 'completed', 
          date: '2023-06-15' 
        },
        { 
          id: 'pay_2', 
          user: 'user2@example.com', 
          amount: '$29.99', 
          status: 'failed', 
          date: '2023-06-10' 
        },
        { 
          id: 'pay_3', 
          user: 'user1@example.com', 
          amount: '$19.99', 
          status: 'pending', 
          date: '2023-06-05' 
        }
      ];
    },
    enabled: !!isAdmin,
  });

  // Get all entries
  const { data: entries = [], isLoading: isLoadingEntries, refetch: refetchEntries } = useQuery({
    queryKey: ['admin-entries'],
    queryFn: async () => {
      if (user) {
        return await getRecentEntries(user.uid);
      }
      return [];
    },
    enabled: !!user && !!isAdmin,
  });

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      toast.error('Please enter a new email address');
      return;
    }

    try {
      setIsUpdating(true);
      await updateAdminEmail(newEmail);
      toast.success('Email updated successfully');
      setNewEmail('');
    } catch (error) {
      console.error('Email update error:', error);
      toast.error('Failed to update email. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsUpdating(true);
      await updateAdminPassword(newPassword);
      toast.success('Password updated successfully');
      setNewPassword('');
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateUserStatusMutation.mutate({ userId, status: newStatus as 'active' | 'inactive' });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (!isAdmin) {
    navigate('/home');
    return null;
  }

  const refreshData = () => {
    refetchUsers();
    refetchPayments();
    refetchEntries();
    toast.success('Data refreshed successfully');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button 
          variant="outline"
          onClick={handleLogout} 
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column - Stats */}
        <div className="w-full md:w-1/3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Admin Controls</CardTitle>
              <CardDescription>Update your admin credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">New Admin Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="new@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <Button 
                    onClick={handleUpdateEmail}
                    disabled={isUpdating || !newEmail}
                    className="flex items-center gap-2"
                  >
                    {isUpdating ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    Update
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New Admin Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button 
                    onClick={handleUpdatePassword}
                    disabled={isUpdating || !newPassword || newPassword.length < 6}
                    className="flex items-center gap-2"
                  >
                    {isUpdating ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={refreshData}
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh Data
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Admin Info</CardTitle>
              <CardDescription>Your current admin details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">User ID:</span>
                <span className="text-sm">{user?.uid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status:</span>
                <span className="text-sm text-green-500 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Active
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Tabs */}
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="users">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <BadgeDollarSign className="h-4 w-4" />
                Data Entries
              </TabsTrigger>
            </TabsList>
            
            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage your application users</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="flex justify-center py-8">
                      <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                              No users found. Users will appear here when they sign up.
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map(user => (
                            <TableRow key={user.id}>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <span className={`capitalize ${user.role === 'admin' ? 'text-blue-500 font-medium' : ''}`}>
                                  {user.role}
                                </span>
                              </TableCell>
                              <TableCell>
                                {user.status === 'active' ? (
                                  <span className="flex items-center gap-1 text-green-500">
                                    <CheckCircle className="h-4 w-4" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-red-500">
                                    <XCircle className="h-4 w-4" />
                                    Inactive
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 px-2"
                                    onClick={() => handleToggleUserStatus(user.id, user.status)}
                                    disabled={user.role === 'admin'}
                                  >
                                    <UserCog className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 px-2 text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={user.role === 'admin'}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div></div>
                  <div className="text-sm text-muted-foreground">Total: {users.length} users</div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Management</CardTitle>
                  <CardDescription>View and manage payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPayments ? (
                    <div className="flex justify-center py-8">
                      <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                              No payment transactions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          payments.map(payment => (
                            <TableRow key={payment.id}>
                              <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                              <TableCell>{payment.user}</TableCell>
                              <TableCell>{payment.amount}</TableCell>
                              <TableCell>
                                {payment.status === 'completed' && (
                                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                    Completed
                                  </span>
                                )}
                                {payment.status === 'pending' && (
                                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                                    Pending
                                  </span>
                                )}
                                {payment.status === 'failed' && (
                                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                    Failed
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>{payment.date}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">Export CSV</Button>
                  <div className="text-sm text-muted-foreground">Total: {payments.length} transactions</div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Data Entries Tab */}
            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle>Data Entries</CardTitle>
                  <CardDescription>View all data entries in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingEntries ? (
                    <div className="flex justify-center py-8">
                      <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : entries.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Container No</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Truck Number</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.slice(0, 5).map(entry => (
                          <TableRow key={entry.id}>
                            <TableCell>{entry.containerNo}</TableCell>
                            <TableCell>{entry.destination}</TableCell>
                            <TableCell>{entry.truckNumber}</TableCell>
                            <TableCell>
                              {entry.status === 'IN' ? (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                  IN
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                  OUT
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No data entries found
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">View All</Button>
                  <div className="text-sm text-muted-foreground">
                    Showing {Math.min(entries.length, 5)} of {entries.length} entries
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;

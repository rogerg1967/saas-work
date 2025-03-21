import { useEffect, useState } from "react";
import { Building2, Users, Shield, MoreVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import {
  getAdminOrganizations,
  getAdminUsers,
  updateOrganizationStatus,
  deleteOrganization,
  updateUserRole,
  deleteUser,
  updateUser,
} from "@/api/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserSubscriptionDialog } from "@/components/admin/UserSubscriptionDialog";

export function Admin() {
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const { toast } = useToast();
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    role: "",
    organizationId: ""
  });
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orgsData, usersData] = await Promise.all([
        getAdminOrganizations(),
        getAdminUsers(),
      ]);
      setOrganizations(orgsData.organizations);
      setUsers(usersData.users);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleStatusChange = async (orgId: string, status: string) => {
    try {
      await updateOrganizationStatus(orgId, status);
      toast({
        title: "Success",
        description: "Organization status updated",
      });
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    try {
      await deleteOrganization(orgId);
      toast({
        title: "Success",
        description: "Organization deleted",
      });
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role);
      toast({
        title: "Success",
        description: "User role updated",
      });
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted",
      });
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organization?._id || "none"
    });
    setEditUserDialogOpen(true);
  };

  const handleManageSubscription = (user) => {
    setSelectedUser(user);
    setSubscriptionDialogOpen(true);
  };

  const handleEditUserFormChange = (e) => {
    const { name, value } = e.target;
    setEditUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditUserSubmit = async () => {
    try {
      const formData = {
        name: editUserForm.name,
        email: editUserForm.email,
        role: editUserForm.role,
        organizationId: editUserForm.organizationId === "none" ? null : editUserForm.organizationId
      };

      await updateUser(currentUser._id, formData);

      toast({
        title: "Success",
        description: "User updated successfully"
      });

      setEditUserDialogOpen(false);
      fetchData(); // Refresh the data
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Shield className="h-8 w-8 text-primary" />
      </div>

      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organizations">
            <Building2 className="h-4 w-4 mr-2" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          {organizations.map((org) => (
            <Card key={org._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>{org.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDeleteOrganization(org._id)}>
                      Delete Organization
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{org.industry}</span>
                    <Select
                      value={org.status}
                      onValueChange={(value) => handleStatusChange(org._id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Users</h4>
                    <div className="flex flex-wrap gap-2">
                      {org.users.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-secondary"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {user.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{user.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {users.map((user) => (
            <Card key={user._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleManageSubscription(user)}>
                      Manage Subscription
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteUser(user._id)}>
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {user.organization ? user.organization.name : "No Organization"}
                  </span>
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user._id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="organization_manager">Manager</SelectItem>
                      <SelectItem value="team_member">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user details here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={editUserForm.name}
                onChange={handleEditUserFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                value={editUserForm.email}
                onChange={handleEditUserFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={editUserForm.role}
                onValueChange={(value) => setEditUserForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="w-full col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="organization_manager">Manager</SelectItem>
                  <SelectItem value="team_member">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="organization" className="text-right">
                Organization
              </Label>
              <Select
                value={editUserForm.organizationId}
                onValueChange={(value) => setEditUserForm(prev => ({ ...prev, organizationId: value }))}
              >
                <SelectTrigger className="w-full col-span-3">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org._id} value={org._id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUserSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedUser && (
        <UserSubscriptionDialog
          userId={selectedUser._id}
          userName={selectedUser.name}
          open={subscriptionDialogOpen}
          onOpenChange={setSubscriptionDialogOpen}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
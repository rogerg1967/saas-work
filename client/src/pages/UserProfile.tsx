import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { getCurrentUser } from "@/api/auth";
import { updateUserProfile, changePassword } from "@/api/profile";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Save, Lock } from "lucide-react";

export function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await getCurrentUser();
        if (response.success) {
          setUser(response.data.user);
          setFormData({
            name: response.data.user.name || '',
            email: response.data.user.email || '',
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const updatedData = {};

      // Only include fields that have changed
      if (formData.name !== user.name) {
        updatedData.name = formData.name;
      }

      if (formData.email !== user.email) {
        updatedData.email = formData.email;
      }

      // If nothing changed, don't make the API call
      if (Object.keys(updatedData).length === 0) {
        setIsEditing(false);
        return;
      }

      const response = await updateUserProfile(updatedData);

      if (response.success) {
        setUser(response.data.user);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    try {
      setUpdatingPassword(true);

      // Validate password inputs
      if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
        toast({
          title: "Error",
          description: "New password and confirmation do not match",
          variant: "destructive",
        });
        return;
      }

      if (passwordFormData.newPassword.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }

      const response = await changePassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Password changed successfully",
        });

        // Reset form and close dialog
        setPasswordFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to current user values
    setFormData({
      name: user.name || '',
      email: user.email || '',
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading user profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Profile</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="space-x-2">
              <Button onClick={handleCancelEdit} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSaveProfile}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Personal Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-lg mt-1">{user.name || "Not provided"}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-lg mt-1">{user.email}</p>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                <p className="text-lg capitalize">{user.role.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Subscription Status</h3>
                <p className="text-lg capitalize">{user.subscriptionStatus || "None"}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Account Created</h3>
              <p className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Login</h3>
              <p className="text-lg">{new Date(user.lastLoginAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>

            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordFormData.currentPassword}
                      onChange={handlePasswordInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordFormData.newPassword}
                      onChange={handlePasswordInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordFormData.confirmPassword}
                      onChange={handlePasswordInputChange}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setPasswordDialogOpen(false)}
                    disabled={updatingPassword}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={!passwordFormData.currentPassword ||
                              !passwordFormData.newPassword ||
                              !passwordFormData.confirmPassword ||
                              updatingPassword}
                  >
                    {updatingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
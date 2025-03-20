import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOrganizations, createOrganization, updateOrganization, deleteOrganization } from "@/api/organizations";
import { getIndustries } from "@/api/industries";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";

type Organization = {
  _id: string;
  name: string;
  industry: string;
  status: string;
};

type OrganizationFormData = {
  name: string;
  industry: string;
};

export function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    industry: '',
  });
  const [industries, setIndustries] = useState<string[]>([]);
  const [industryLoading, setIndustryLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIndustryLoading(true);
        const response = await getIndustries();
        setIndustries(response.industries);
      } catch (error) {
        console.error("Failed to fetch industries:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load industry options. Please try again.",
        });
      } finally {
        setIndustryLoading(false);
      }
    };

    fetchIndustries();
  }, [toast]);

  const fetchOrganizations = async () => {
    try {
      const data = await getOrganizations();
      setOrganizations(data.organizations);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleCreateOrganization = async () => {
    try {
      const result = await createOrganization(formData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Organization created successfully",
        });
        setIsCreateDialogOpen(false);
        setFormData({ name: '', industry: '' });
        fetchOrganizations();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrg) return;
    try {
      const result = await updateOrganization(selectedOrg._id, formData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Organization updated successfully",
        });
        setIsEditDialogOpen(false);
        fetchOrganizations();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleDeleteOrganization = async (id: string) => {
    try {
      const result = await deleteOrganization(id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Organization deleted successfully",
        });
        fetchOrganizations();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const openEditDialog = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({ name: org.name, industry: org.industry });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Organizations</h1>
        {user?.role === 'admin' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Organization</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    disabled={industryLoading}
                    value={formData.industry}
                    onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateOrganization} className="w-full">
                  Create Organization
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Card key={org._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{org.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {org.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{org.industry}</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(org)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {user?.role === 'admin' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteOrganization(org._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-industry">Industry</Label>
              <Select
                disabled={industryLoading}
                value={formData.industry}
                onValueChange={(value) => setFormData({ ...formData, industry: value })}
              >
                <SelectTrigger id="edit-industry">
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdateOrganization} className="w-full">
              Update Organization
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
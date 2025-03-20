import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MessageSquare, Bot, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getChatbots, createChatbot, getOrganizationsForAdmin } from "@/api/chat";
import { updateChatbot, deleteChatbot } from "@/api/chatbots";
import { getAvailableModels } from "@/api/messages";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";

export function Chatbots() {
  const [chatbots, setChatbots] = useState([]);
  const [models, setModels] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedChatbot, setSelectedChatbot] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    provider: "OpenAI",
    description: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    model: "",
    provider: "OpenAI",
    description: "",
  });

  useEffect(() => {
    fetchChatbots();
    fetchModels();

    // Only fetch organizations if user is admin
    if (isAdmin) {
      fetchOrganizations();
    }
  }, [isAdmin]);

  useEffect(() => {
    // Filter models when provider changes
    if (models.length > 0) {
      const filtered = models.filter(model =>
        model.provider.toLowerCase() === formData.provider.toLowerCase()
      );
      setFilteredModels(filtered);

      // Reset selected model when provider changes
      setFormData(prev => ({
        ...prev,
        model: filtered.length > 0 ? filtered[0].id : ""
      }));
    }
  }, [formData.provider, models]);

  useEffect(() => {
    // Filter models when provider changes for edit form
    if (models.length > 0) {
      const filtered = models.filter(model =>
        model.provider.toLowerCase() === editFormData.provider.toLowerCase()
      );
      setFilteredModels(filtered);

      // Reset selected model when provider changes
      setEditFormData(prev => ({
        ...prev,
        model: filtered.length > 0 ? filtered[0].id : ""
      }));
    }
  }, [editFormData.provider, models]);

  const fetchChatbots = async () => {
    try {
      const data = await getChatbots();
      setChatbots(data.chatbots);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const fetchModels = async () => {
    try {
      const data = await getAvailableModels();
      setModels(data.models);
      // Initially filter for the default provider
      setFilteredModels(data.models.filter(model =>
        model.provider.toLowerCase() === formData.provider.toLowerCase()
      ));
      // Set initial model
      if (data.models.length > 0) {
        const openAIModels = data.models.filter(model =>
          model.provider.toLowerCase() === 'openai'
        );
        if (openAIModels.length > 0) {
          setFormData(prev => ({
            ...prev,
            model: openAIModels[0].id
          }));
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load models",
      });
    }
  };

  const fetchOrganizations = async () => {
    try {
      const data = await getOrganizationsForAdmin();
      setOrganizations(data.organizations || []);

      // Set first organization as default if there are organizations
      if (data.organizations && data.organizations.length > 0) {
        setSelectedOrganization(data.organizations[0]._id);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load organizations",
      });
    }
  };

  const handleCreateChatbot = async () => {
    try {
      setIsLoading(true);

      const requestData = {
        ...formData,
        ...(isAdmin && { organizationId: selectedOrganization }) // Only include organizationId for admin users
      };

      const result = await createChatbot(requestData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Chatbot created successfully",
        });
        setIsDialogOpen(false);
        fetchChatbots();
        setFormData({ name: "", model: "", provider: "OpenAI", description: "" });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChatbot = (chatbot) => {
    setSelectedChatbot(chatbot);
    setEditFormData({
      name: chatbot.name,
      model: chatbot.model,
      provider: chatbot.provider,
      description: chatbot.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateChatbot = async () => {
    try {
      setIsLoading(true);
      const result = await updateChatbot(selectedChatbot._id, editFormData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Chatbot updated successfully",
        });
        setIsEditDialogOpen(false);
        fetchChatbots();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = (chatbot) => {
    setSelectedChatbot(chatbot);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteChatbot = async () => {
    try {
      setIsLoading(true);
      const result = await deleteChatbot(selectedChatbot._id);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Chatbot deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        fetchChatbots();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (e, chatbot) => {
    // Only navigate if the click wasn't on the dropdown or its children
    if (!e.target.closest('.dropdown-menu')) {
      navigate(`/chatbots/${chatbot._id}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6" />
          <h1 className="text-3xl font-bold">AI Chatbots</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Chatbot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Chatbot</DialogTitle>
              <DialogDescription>
                Configure your new AI chatbot assistant
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter chatbot name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      provider: value,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OpenAI">OpenAI</SelectItem>
                    <SelectItem value="Anthropic">Anthropic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      model: value,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter chatbot description"
                />
              </div>

              {/* Only show organization selection for admin users */}
              {isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Select
                    value={selectedOrganization}
                    onValueChange={setSelectedOrganization}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org._id} value={org._id}>
                          {org.name} ({org.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                onClick={handleCreateChatbot}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Chatbot"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {chatbots.map((bot) => (
          <Card
            key={bot._id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={(e) => handleCardClick(e, bot)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center">
                <span>{bot.name}</span>
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 dropdown-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleEditChatbot(bot);
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConfirm(bot);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {bot.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{bot.provider}</span>
                <Button variant="secondary" className="ml-2">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Chatbot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chatbot</DialogTitle>
            <DialogDescription>
              Update your chatbot configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                placeholder="Enter chatbot name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-provider">Provider</Label>
              <Select
                value={editFormData.provider}
                onValueChange={(value) => {
                  setEditFormData({
                    ...editFormData,
                    provider: value,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OpenAI">OpenAI</SelectItem>
                  <SelectItem value="Anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model">AI Model</Label>
              <Select
                value={editFormData.model}
                onValueChange={(value) => {
                  setEditFormData({
                    ...editFormData,
                    model: value,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  {filteredModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, description: e.target.value })
                }
                placeholder="Enter chatbot description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateChatbot}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Chatbot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the chatbot "{selectedChatbot?.name}" and all associated messages.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteChatbot}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
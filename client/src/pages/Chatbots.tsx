import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MessageSquare, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getChatbots, createChatbot } from "@/api/chat";
import { getAvailableModels } from "@/api/messages";
import { useToast } from "@/hooks/useToast";

export function Chatbots() {
  const [chatbots, setChatbots] = useState([]);
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    provider: "",
    description: "",
  });

  useEffect(() => {
    fetchChatbots();
    fetchModels();
  }, []);

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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load models",
      });
    }
  };

  const handleCreateChatbot = async () => {
    try {
      setIsLoading(true);
      const result = await createChatbot(formData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Chatbot created successfully",
        });
        setIsDialogOpen(false);
        fetchChatbots();
        setFormData({ name: "", model: "", provider: "", description: "" });
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
                <Label htmlFor="model">AI Model</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) => {
                    const selectedModel = models.find((m) => m.id === value);
                    setFormData({
                      ...formData,
                      model: value,
                      provider: selectedModel?.provider || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} ({model.provider})
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
            onClick={() => navigate(`/chatbots/${bot._id}`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{bot.name}</span>
                <Bot className="h-5 w-5 text-primary" />
              </CardTitle>
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
    </div>
  );
}
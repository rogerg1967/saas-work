import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Lock, User, Wallet, Bot } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { getLLMSettings, updateLLMSettings } from "@/api/llm";
import { useToast } from "@/hooks/useToast";
import { getAvailableModels } from "@/api/messages";

export function Settings() {
  const [llmSettings, setLLMSettings] = useState({
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    openaiApiKey: '',
    anthropicApiKey: ''
  });
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLLMSettings = async () => {
      try {
        const { settings } = await getLLMSettings();
        setLLMSettings(settings);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load LLM settings"
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
          description: error.message || "Failed to load models"
        });
      }
    };
    
    fetchLLMSettings();
    fetchModels();
  }, [toast]);

  useEffect(() => {
    if (models.length > 0) {
      const filtered = models.filter(model =>
        model.provider.toLowerCase() === llmSettings.provider.toLowerCase()
      );
      setFilteredModels(filtered);

      // Reset selected model when provider changes
      if (!filtered.find(m => m.id === llmSettings.model)) {
        setLLMSettings(prev => ({
          ...prev,
          model: filtered.length > 0 ? filtered[0].id : ""
        }));
      }
    }
  }, [llmSettings.provider, models]);

  const handleUpdateLLMSettings = async () => {
    try {
      const { success } = await updateLLMSettings(llmSettings);
      if (success) {
        toast({
          title: "Success",
          description: "LLM settings updated successfully"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update LLM settings"
      });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle>LLM Settings</CardTitle>
            </div>
            <CardDescription>Configure your AI model settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="provider">AI Provider</Label>
              <Select
                value={llmSettings.provider}
                onValueChange={(value) => setLLMSettings({ ...llmSettings, provider: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {llmSettings.provider === 'openai' && (
              <div className="space-y-2">
                <Label>OpenAI API Key</Label>
                <Input
                  type="password"
                  value={llmSettings.openaiApiKey}
                  onChange={(e) => setLLMSettings({ ...llmSettings, openaiApiKey: e.target.value })}
                  placeholder="Enter your OpenAI API key"
                />
                <p className="text-sm text-muted-foreground">
                  Required for using OpenAI models like GPT-4 and GPT-3.5
                </p>
              </div>
            )}

            {llmSettings.provider === 'anthropic' && (
              <div className="space-y-2">
                <Label>Anthropic API Key</Label>
                <Input
                  type="password"
                  value={llmSettings.anthropicApiKey}
                  onChange={(e) => setLLMSettings({ ...llmSettings, anthropicApiKey: e.target.value })}
                  placeholder="Enter your Anthropic API key"
                />
                <p className="text-sm text-muted-foreground">
                  Required for using Anthropic models like Claude
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select
                value={llmSettings.model}
                onValueChange={(value) => setLLMSettings({ ...llmSettings, model: value })}
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
              <Label>Temperature ({llmSettings.temperature})</Label>
              <Slider
                value={[llmSettings.temperature]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={([value]) => setLLMSettings({ ...llmSettings, temperature: value })}
              />
              <p className="text-sm text-muted-foreground">
                Controls randomness in responses. Lower values make responses more focused and deterministic.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={llmSettings.maxTokens}
                onChange={(e) => setLLMSettings({ ...llmSettings, maxTokens: parseInt(e.target.value) })}
                min={1}
                max={4096}
              />
              <p className="text-sm text-muted-foreground">
                Maximum length of generated responses in tokens.
              </p>
            </div>

            <Button onClick={handleUpdateLLMSettings} className="w-full">
              Save LLM Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Account Settings</CardTitle>
            </div>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Privacy</CardTitle>
            </div>
            <CardDescription>Manage your privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Data Collection</Label>
                <p className="text-sm text-muted-foreground">Allow data collection for service improvement</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Public Profile</Label>
                <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <CardTitle>Billing</CardTitle>
            </div>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <p className="text-sm text-muted-foreground">Professional</p>
                </div>
                <Button variant="outline">Change Plan</Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Next billing date: January 1, 2024
              </div>
            </div>
            <Button variant="outline" className="w-full">View Billing History</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive marketing updates</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
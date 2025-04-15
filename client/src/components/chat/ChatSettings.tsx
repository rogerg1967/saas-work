import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Model = {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
};

interface ChatSettingsProps {
  selectedProvider: string;
  selectedModel: string;
  historyEnabled: boolean;
  historyLimit: number;
  models: Model[];
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  onHistoryEnabledChange: (enabled: boolean) => void;
  onHistoryLimitChange: (limit: number) => void;
  onSaveSettings: () => Promise<void>;
}

export function ChatSettings({
  selectedProvider,
  selectedModel,
  historyEnabled,
  historyLimit,
  models,
  onProviderChange,
  onModelChange,
  onHistoryEnabledChange,
  onHistoryLimitChange,
  onSaveSettings,
}: ChatSettingsProps) {
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);

  useEffect(() => {
    // Filter models when provider changes
    if (models.length > 0) {
      console.log(`Filtering models for provider: ${selectedProvider}`);
      const filtered = models.filter(model =>
        model.provider.toLowerCase() === selectedProvider.toLowerCase()
      );
      console.log(`Found ${filtered.length} models for provider ${selectedProvider}`);
      setFilteredModels(filtered);

      // Set the first model of the filtered list as selected if no model is selected
      // or the currently selected model isn't from the current provider
      if (!selectedModel || !filtered.find(m => m.id === selectedModel)) {
        console.log(`Setting default model to ${filtered[0]?.id || ""}`);
        onModelChange(filtered[0]?.id || "");
      }
    }
  }, [selectedProvider, models, selectedModel, onModelChange]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Chat Settings</SheetTitle>
          <SheetDescription>
            Configure the AI model and behavior
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Provider</label>
            <Select value={selectedProvider} onValueChange={onProviderChange}>
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
            <label className="text-sm font-medium">AI Model</label>
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                {filteredModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center">
                      <span>{model.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Remember Conversation History</label>
              <Switch
                checked={historyEnabled}
                onCheckedChange={onHistoryEnabledChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enable to maintain context across messages
            </p>
          </div>
          {historyEnabled && (
            <div className="space-y-2">
              <label className="text-sm font-medium">History Length</label>
              <Select
                value={historyLimit.toString()}
                onValueChange={(value) => onHistoryLimitChange(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select history length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 messages</SelectItem>
                  <SelectItem value="10">10 messages</SelectItem>
                  <SelectItem value="20">20 messages</SelectItem>
                  <SelectItem value="30">30 messages</SelectItem>
                  <SelectItem value="50">50 messages</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Number of previous messages to include for context
              </p>
            </div>
          )}
          <Button className="w-full mt-4" onClick={onSaveSettings}>
            Save Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
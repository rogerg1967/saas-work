import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Send, Image as ImageIcon, Bot, Settings, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendMessage, getChatHistory, getAvailableModels } from "@/api/messages";
import { getLLMSettings, updateLLMSettings } from "@/api/llm";
import { useToast } from "@/hooks/useToast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { updateChatbotSettings, getChatbot } from "@/api/chat";

type Message = {
  id: string;
  role: string;
  content: string;
  timestamp: string;
  image?: string;
};

type Model = {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
};

export function Chat() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("OpenAI");
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [chatbot, setChatbot] = useState(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchChatHistory();
      fetchModels();
      fetchChatbot();
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        setSelectedModel(filtered[0]?.id || "");
      }
    }
  }, [selectedProvider, models]);

  const fetchChatHistory = async () => {
    try {
      const data = await getChatHistory(id);
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chat history",
      });
    }
  };

  const fetchModels = async () => {
    try {
      const data = await getAvailableModels();
      setModels(data.models);
    } catch (error) {
      console.error("Error fetching models:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load models",
      });
    }
  };

  const fetchChatbot = async () => {
    try {
      const data = await getChatbot(id);
      setChatbot(data.chatbot);
      console.log("Successfully fetched chatbot details");

      // If chatbot has provider and model set, use those instead of global settings
      if (data.chatbot.provider && data.chatbot.model) {
        // Capitalize the first letter of the provider name for display in the UI dropdown
        const providerName = data.chatbot.provider.charAt(0).toUpperCase() + data.chatbot.provider.slice(1);
        console.log(`Setting provider to ${providerName} and model to ${data.chatbot.model} from chatbot settings`);

        // Set the provider first to trigger the useEffect that filters models
        setSelectedProvider(providerName);

        // Then set the model
        setSelectedModel(data.chatbot.model);
      } else {
        // Otherwise, fall back to global settings
        console.log("No chatbot-specific settings found, falling back to global settings");
        fetchLLMSettings();
      }
    } catch (error) {
      console.error("Error fetching chatbot:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chatbot details",
      });
      // Fall back to global settings if fetching chatbot fails
      fetchLLMSettings();
    }
  };

  const fetchLLMSettings = async () => {
    try {
      const data = await getLLMSettings();
      if (data.settings) {
        setSelectedProvider(data.settings.provider.charAt(0).toUpperCase() + data.settings.provider.slice(1));
        setSelectedModel(data.settings.model);
      }
    } catch (error) {
      console.error("Error fetching LLM settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load LLM settings",
      });
    }
  };

  const saveChatbotSettings = async () => {
    try {
      if (!id) return;

      console.log(`Saving settings: provider=${selectedProvider.toLowerCase()}, model=${selectedModel}`);

      await updateChatbotSettings(id, {
        provider: selectedProvider.toLowerCase(), // Make sure provider is lowercase for backend
        model: selectedModel
      });

      toast({
        title: "Success",
        description: "Chat settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving chatbot settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save settings",
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "Error",
          description: "Image size should be less than 5MB",
        });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading || !id) return;

    const messageContent = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Create and add the user message immediately for better UX
      const userMessage: Message = {
        id: Date.now().toString() + "-user",
        role: "user",
        content: messageContent,
        timestamp: new Date().toISOString(),
        image: imagePreview || undefined,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Send the message to the backend
      const response = await sendMessage(id, messageContent, selectedImage, selectedModel);

      // Create the assistant message from the response
      const assistantMessage: Message = {
        id: response.id || Date.now().toString() + "-assistant",
        role: response.role || "assistant",
        content: response.content, // This is the key change - use content instead of response
        timestamp: response.timestamp || new Date().toISOString(),
      };

      // Add the assistant message to the chat
      setMessages((prev) => [...prev, assistantMessage]);

      setSelectedImage(null);
      setImagePreview(null);

      // Reset textarea height to default (2 rows)
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = ''; // Reset to CSS default
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
        console.log('Scrolled to bottom, viewport height:', viewport.scrollHeight);
      } else {
        console.log('Viewport element not found within ScrollArea');
      }
    } else {
      console.log('ScrollAreaRef is not attached to any element');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem-3.5rem)]">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <CardTitle>AI Chat Assistant</CardTitle>
          </div>
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
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
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
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
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
                <Button
                  className="w-full mt-4"
                  onClick={saveChatbotSettings}
                >
                  Save Settings
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-6 overflow-hidden">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "assistant"
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "assistant"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="User uploaded"
                        className="max-w-full h-auto rounded-lg mb-2"
                      />
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {format(new Date(message.timestamp), "HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t">
          {imagePreview && (
            <div className="mb-4 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-32 rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              ref={fileInputRef}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);

                // Auto-grow functionality
                const textarea = e.target;
                textarea.style.height = 'auto'; // Reset height to recalculate

                // Calculate new height based on content
                const newHeight = Math.min(textarea.scrollHeight, 12 * 24); // Assuming 24px per line (adjust as needed)
                textarea.style.height = `${newHeight}px`;
              }}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 min-h-[40px] overflow-y-auto"
              style={{
                maxHeight: '288px', // 12 rows * 24px per row
                resize: 'none'
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
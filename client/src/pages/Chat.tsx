import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { MessageSquare, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/useToast";

// Import API services
import { sendMessage, getChatHistory, getAvailableModels } from "@/api/messages";
import { updateChatbotSettings, getChatbot } from "@/api/chat";
import {
  getChatbotThreads,
  createThread,
  getThread,
  updateThread,
  deleteThread,
  getThreadMessages
} from "@/api/threads";

// Import custom components
import { ChatThreadList } from "@/components/chat/ChatThreadList";
import { ChatSettings } from "@/components/chat/ChatSettings";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatMessageInput } from "@/components/chat/ChatMessageInput";

// Types
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

type Thread = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
};

export function Chat() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const threadId = searchParams.get("thread");

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("OpenAI");
  const [chatbot, setChatbot] = useState(null);
  const [historyEnabled, setHistoryEnabled] = useState<boolean>(true);
  const [historyLimit, setHistoryLimit] = useState<number>(10);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [isLoadingThreads, setIsLoadingThreads] = useState<boolean>(false);
  const [threadDrawerOpen, setThreadDrawerOpen] = useState<boolean>(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchChatbot();
      fetchModels();
      fetchThreads();
    }
  }, [id]);

  useEffect(() => {
    if (id && threadId) {
      fetchThreadMessages(threadId);
    } else if (id && threads.length > 0 && !threadId) {
      // If no thread is specified but threads exist, use the most recent one
      const mostRecentThread = threads[0]; // Assuming threads are sorted by lastMessageAt
      setSearchParams({ thread: mostRecentThread.id });
    }
  }, [id, threadId, threads]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchThreads = async () => {
    if (!id) return;

    setIsLoadingThreads(true);
    try {
      const data = await getChatbotThreads(id);
      setThreads(data.threads);

      // If there are no threads, create a default one
      if (data.threads.length === 0) {
        handleCreateThread("New Conversation");
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load conversation threads",
      });
    } finally {
      setIsLoadingThreads(false);
    }
  };

  const fetchThreadMessages = async (threadId: string) => {
    try {
      setIsLoading(true);
      const data = await getThreadMessages(threadId);
      setMessages(data.messages);

      // Find and set the current thread
      const thread = threads.find(t => t.id === threadId);
      if (thread) {
        setCurrentThread(thread);
      } else {
        // If thread isn't in our list, fetch it directly
        const threadData = await getThread(threadId);
        setCurrentThread(threadData.thread);
      }
    } catch (error) {
      console.error("Error fetching thread messages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load conversation messages",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateThread = async (name: string) => {
    if (!id) return;

    try {
      const data = await createThread(id, name);
      setThreads(prevThreads => [data.thread, ...prevThreads]);
      setSearchParams({ thread: data.thread.id });
      setCurrentThread(data.thread);
      setMessages([]);

      toast({
        title: "Success",
        description: "New conversation created",
      });
    } catch (error) {
      console.error("Error creating thread:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create new conversation",
      });
    }
  };

  const handleRenameThread = async (threadId: string, newName: string) => {
    try {
      const data = await updateThread(threadId, { name: newName });

      // Update threads list
      setThreads(prevThreads =>
        prevThreads.map(thread =>
          thread.id === threadId ? data.thread : thread
        )
      );

      // Update current thread if it's the one being renamed
      if (currentThread?.id === threadId) {
        setCurrentThread(data.thread);
      }

      toast({
        title: "Success",
        description: "Conversation renamed",
      });
    } catch (error) {
      console.error("Error renaming thread:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to rename conversation",
      });
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    try {
      await deleteThread(threadId);

      // Remove from threads list
      setThreads(prevThreads =>
        prevThreads.filter(thread => thread.id !== threadId)
      );

      // If this is the current thread, switch to another one
      if (currentThread?.id === threadId) {
        if (threads.length > 1) {
          const nextThread = threads.find(thread => thread.id !== threadId);
          if (nextThread) {
            setSearchParams({ thread: nextThread.id });
          }
        } else {
          // If this was the last thread, create a new one
          handleCreateThread("New Conversation");
        }
      }

      toast({
        title: "Success",
        description: "Conversation deleted",
      });
    } catch (error) {
      console.error("Error deleting thread:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete conversation",
      });
    }
  };

  const fetchChatbot = async () => {
    try {
      const data = await getChatbot(id);
      setChatbot(data.chatbot);
      console.log("Successfully fetched chatbot details");

      // Set history settings
      setHistoryEnabled(data.chatbot.historyEnabled !== false); // Default to true if undefined
      setHistoryLimit(data.chatbot.historyLimit || 10); // Default to 10 if undefined

      // If chatbot has provider and model set, use those instead of global settings
      if (data.chatbot.provider && data.chatbot.model) {
        // Capitalize the first letter of the provider name for display in the UI dropdown
        const providerName = data.chatbot.provider.charAt(0).toUpperCase() + data.chatbot.provider.slice(1);
        console.log(`Setting provider to ${providerName} and model to ${data.chatbot.model} from chatbot settings`);

        // Set the provider
        setSelectedProvider(providerName);

        // Then set the model
        setSelectedModel(data.chatbot.model);
      }
    } catch (error) {
      console.error("Error fetching chatbot:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chatbot details",
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

  const saveChatbotSettings = async () => {
    try {
      if (!id) return;

      console.log(`Saving settings: provider=${selectedProvider.toLowerCase()}, model=${selectedModel}, historyEnabled=${historyEnabled}, historyLimit=${historyLimit}`);

      await updateChatbotSettings(id, {
        provider: selectedProvider.toLowerCase(), // Make sure provider is lowercase for backend
        model: selectedModel,
        historyEnabled: historyEnabled,
        historyLimit: historyLimit
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

  const handleSendMessage = async (messageContent: string, selectedImage: File | null) => {
    if ((!messageContent.trim() && !selectedImage) || isLoading || !id || !threadId) return;

    setIsLoading(true);

    try {
      // Create and add the user message immediately for better UX
      const userMessage: Message = {
        id: Date.now().toString() + "-user",
        role: "user",
        content: messageContent,
        timestamp: new Date().toISOString(),
        image: selectedImage ? URL.createObjectURL(selectedImage) : undefined,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Send the message to the backend
      console.log(`Sending message to chatbot ${id} in thread ${threadId}${selectedImage ? ' with image' : ''}`);
      const response = await sendMessage(id, messageContent, selectedImage, selectedModel, threadId);
      console.log('Received response:', response);

      // Create the assistant message from the response
      const assistantMessage: Message = {
        id: response.id || Date.now().toString() + "-assistant",
        role: response.role || "assistant",
        content: response.content,
        timestamp: response.timestamp || new Date().toISOString(),
      };

      // Add the assistant message to the chat
      setMessages((prev) => [...prev, assistantMessage]);

      // Refresh the threads list to update last message time
      fetchThreads();
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

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
        console.log('Scrolled to bottom, viewport height:', viewport.scrollHeight);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem-3.5rem)]">
      <div className="flex h-full">
        {/* Mobile Conversation Threads Sidebar */}
        <Sheet open={threadDrawerOpen} onOpenChange={setThreadDrawerOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 left-4 lg:hidden z-10"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[300px] p-0 bg-secondary">
            <ChatThreadList
              threads={threads}
              currentThreadId={threadId}
              isLoading={isLoadingThreads}
              onThreadSelect={(id) => {
                setSearchParams({ thread: id });
                setThreadDrawerOpen(false);
              }}
              onCreateThread={handleCreateThread}
              onRenameThread={handleRenameThread}
              onDeleteThread={handleDeleteThread}
              isMobile={true}
              onClose={() => setThreadDrawerOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Desktop Conversation Threads Sidebar */}
        <div className="hidden lg:block w-[300px] border-r bg-background">
          <ChatThreadList
            threads={threads}
            currentThreadId={threadId}
            isLoading={isLoadingThreads}
            onThreadSelect={(id) => setSearchParams({ thread: id })}
            onCreateThread={handleCreateThread}
            onRenameThread={handleRenameThread}
            onDeleteThread={handleDeleteThread}
          />
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <CardTitle>AI Chat Assistant</CardTitle>
            </div>
            <ChatSettings
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              historyEnabled={historyEnabled}
              historyLimit={historyLimit}
              models={models}
              onProviderChange={setSelectedProvider}
              onModelChange={setSelectedModel}
              onHistoryEnabledChange={setHistoryEnabled}
              onHistoryLimitChange={setHistoryLimit}
              onSaveSettings={saveChatbotSettings}
            />
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Bot className="h-12 w-12 mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground">
                    Send a message to start chatting with the AI assistant.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                </div>
              )}
            </ScrollArea>
            <ChatMessageInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
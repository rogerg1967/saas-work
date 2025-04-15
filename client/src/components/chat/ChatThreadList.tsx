import { useState } from "react";
import { Plus, Loader2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Thread = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
};

interface ChatThreadListProps {
  threads: Thread[];
  currentThreadId: string | null;
  isLoading: boolean;
  onThreadSelect: (threadId: string) => void;
  onCreateThread: (name: string) => void;
  onRenameThread: (threadId: string, newName: string) => void;
  onDeleteThread: (threadId: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export function ChatThreadList({
  threads,
  currentThreadId,
  isLoading,
  onThreadSelect,
  onCreateThread,
  onRenameThread,
  onDeleteThread,
  isMobile = false,
  onClose,
}: ChatThreadListProps) {
  const [newThreadName, setNewThreadName] = useState<string>("");

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-medium">Conversations</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Conversation</DialogTitle>
              <DialogDescription>
                Start a new conversation with the AI assistant.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Conversation name"
                value={newThreadName}
                onChange={(e) => setNewThreadName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    onCreateThread(newThreadName || "New Conversation");
                    setNewThreadName("");
                  }}
                >
                  Create
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`flex items-center justify-between p-2 cursor-pointer rounded-md hover:bg-accent hover:text-accent-foreground ${
                  thread.id === currentThreadId ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => {
                  onThreadSelect(thread.id);
                  if (isMobile && onClose) onClose();
                }}
              >
                <div className="truncate">{thread.name}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Rename
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Rename Conversation</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <Input
                            placeholder="Conversation name"
                            defaultValue={thread.name}
                            id={`rename-${thread.id}`}
                          />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              onClick={() => {
                                const input = document.getElementById(`rename-${thread.id}`) as HTMLInputElement;
                                if (input && input.value) {
                                  onRenameThread(thread.id, input.value);
                                }
                              }}
                            >
                              Save
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-destructive focus:text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Conversation</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this conversation? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              variant="destructive"
                              onClick={() => onDeleteThread(thread.id)}
                            >
                              Delete
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <Button
          className="w-full"
          onClick={() => onCreateThread("New Conversation")}
        >
          <Plus className="h-4 w-4 mr-2" /> New Conversation
        </Button>
      </div>
    </div>
  );
}
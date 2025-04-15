import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { Send, Image as ImageIcon, File as FileIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatMessageInputProps {
  onSendMessage: (message: string, file: File | null) => Promise<void>;
  isLoading: boolean;
}

export function ChatMessageInput({ onSendMessage, isLoading }: ChatMessageInputProps) {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'document' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        alert("File size should be less than 25MB");
        return;
      }

      setSelectedFile(file);

      // Determine if it's an image or document
      const isImage = file.type.startsWith('image/');
      setFileType(isImage ? 'image' : 'document');

      // For images, create a preview
      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For documents, just show the filename
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;

    try {
      await onSendMessage(input, selectedFile);
      setInput("");
      setSelectedFile(null);
      setFilePreview(null);
      setFileType(null);

      // Reset textarea height to default
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = '';
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t flex flex-col">
      {selectedFile && (
        <div className="relative mb-2 inline-block">
          {fileType === 'image' && filePreview ? (
            <img
              src={filePreview}
              alt="Selected"
              className="max-h-32 rounded-md border"
            />
          ) : (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md border">
              <FileIcon className="h-5 w-5" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
            </div>
          )}
          <button
            type="button"
            onClick={removeFile}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="min-h-10 flex-1 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.csv,.ppt,.pptx"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="Upload image or document"
          >
            {fileType === 'document' ? (
              <FileIcon className="h-4 w-4" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </Button>
          <Button type="submit" size="icon" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
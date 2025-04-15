import { format } from "date-fns";

type Message = {
  id: string;
  role: string;
  content: string;
  timestamp: string;
  image?: string;
};

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-4`}>
      <div className="flex items-center mb-1">
        <span className="text-xs text-muted-foreground">
          {isUser ? 'You' : 'AI Assistant'} • {format(new Date(message.timestamp), 'h:mm a')}
        </span>
      </div>
      <div
        className={`rounded-lg px-4 py-2 max-w-[80%] ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {message.image && (
          <div className="mb-2">
            <img
              src={message.image}
              alt="Uploaded image"
              className="rounded max-w-full max-h-64 object-contain"
              onError={(e) => {
                console.error(`Resource error: IMG failed to load. URL: ${message.image}`);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}
import { cn } from "@/lib/utils";
import { Bot, User, Image, Volume2 } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  audio?: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          isUser
            ? "bg-primary/20 text-primary"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      <div
        className={cn(
          "flex flex-col gap-2 max-w-[80%] rounded-xl px-4 py-3",
          isUser ? "message-user" : "message-assistant"
        )}
      >
        {message.image && (
          <div className="relative group">
            <img
              src={message.image}
              alt="Uploaded fault image"
              className="max-w-xs rounded-lg border border-border"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-mono">
              <Image className="h-3 w-3 text-primary" />
              <span className="text-muted-foreground">Image</span>
            </div>
          </div>
        )}

        {message.audio && (
          <div className="flex items-center gap-3 bg-secondary/50 rounded-lg px-3 py-2">
            <Volume2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono text-muted-foreground">
              Audio Recording
            </span>
          </div>
        )}

        <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
          {message.content.split('\n').map((line, i) => {
            // Handle bold text
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={i} className="mb-1 last:mb-0">
                {parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

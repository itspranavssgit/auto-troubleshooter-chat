import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Bot } from "lucide-react";

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to AutoDiagAI! I'm your vehicle fault detection assistant powered by advanced AI.\n\n🔧 **What I can analyze:**\n• Engine fault images (corrosion, leaks, wear, damage)\n• Engine sounds (knocking, rattling, misfires)\n• Vehicle symptoms and behavior\n\nUpload an image or record an engine sound to get started, or describe your vehicle's symptoms.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (
    content: string,
    image?: string,
    audio?: { base64: string; mimeType: string }
  ) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      image,
      audio: audio?.base64,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke("vehicle-diagnosis", {
        body: {
          message: content,
          image: image ? image.split(",")[1] : undefined,
          audio: audio?.base64,
          audioMimeType: audio?.mimeType,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to get diagnosis");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.diagnosis || "I couldn't analyze that. Please try again.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Diagnosis error:", error);
      
      let errorMessage = "Failed to analyze. Please try again.";
      if (error.message?.includes("429")) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (error.message?.includes("402")) {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      }
      
      toast.error(errorMessage);

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ " + errorMessage,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="container mx-auto max-w-4xl space-y-6 pb-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex gap-4 animate-fade-in">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div className="message-assistant rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-sm text-muted-foreground font-mono">
                    Analyzing...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}

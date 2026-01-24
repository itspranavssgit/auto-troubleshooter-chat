import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "./ImageUpload";
import { AudioRecorder } from "./AudioRecorder";

interface ChatInputProps {
  onSend: (message: string, image?: string, audio?: { base64: string; mimeType: string }) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<{
    base64: string;
    mimeType: string;
  } | null>(null);

  const handleSubmit = () => {
    if (!message.trim() && !selectedImage && !recordedAudio) return;

    const msgText = message.trim() || (selectedImage ? "Please analyze this engine fault image." : "Please analyze this engine sound for potential faults.");
    
    onSend(
      msgText,
      selectedImage || undefined,
      recordedAudio || undefined
    );

    setMessage("");
    setSelectedImage(null);
    setRecordedAudio(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4 space-y-4">
      {/* Media Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageUpload
          onImageSelect={setSelectedImage}
          selectedImage={selectedImage}
          onClear={() => setSelectedImage(null)}
        />
        <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-6">
          <p className="text-sm font-medium text-foreground mb-2">
            Record Engine Sound
          </p>
          <AudioRecorder
            onAudioCapture={(base64, mimeType) =>
              setRecordedAudio({ base64, mimeType })
            }
            recordedAudio={recordedAudio?.base64 || null}
            onClear={() => setRecordedAudio(null)}
          />
        </div>
      </div>

      {/* Text Input */}
      <div className="flex gap-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the issue or ask about the uploaded media..."
          className="min-h-[60px] resize-none bg-muted border-border focus:border-primary focus:ring-primary/20"
          disabled={isLoading}
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading || (!message.trim() && !selectedImage && !recordedAudio)}
          className="px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}

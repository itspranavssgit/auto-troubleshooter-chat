import { useRef, useState, useEffect } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  onAudioCapture: (base64: string, mimeType: string) => void;
  recordedAudio: string | null;
  onClear: () => void;
}

export function AudioRecorder({
  onAudioCapture,
  recordedAudio,
  onClear,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      setPermissionDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          onAudioCapture(base64, recorder.mimeType || "audio/webm");
        };
        reader.readAsDataURL(blob);
        
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        setPermissionDenied(true);
      }
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (recordedAudio) {
    return (
      <div className="flex items-center gap-3 bg-secondary/50 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-sm font-mono text-foreground">
            Audio Recorded
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">
        Microphone access denied. Please grant permission to record engine sounds.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {isRecording ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive recording-pulse" />
            <span className="font-mono text-sm text-destructive">
              {formatTime(recordingTime)}
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={stopRecording}
            className="gap-2"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={startRecording}
          className="gap-2 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Mic className="h-4 w-4" />
          Record Engine Sound
        </Button>
      )}
    </div>
  );
}

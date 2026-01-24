import { useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export function ImageUpload({
  onImageSelect,
  selectedImage,
  onClear,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      onImageSelect(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (selectedImage) {
    return (
      <div className="relative inline-block">
        <img
          src={selectedImage}
          alt="Selected"
          className="h-20 w-20 object-cover rounded-lg border border-primary/30"
        />
        <button
          onClick={onClear}
          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "upload-zone flex flex-col items-center gap-3 cursor-pointer",
        isDragging && "active"
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Camera className="h-5 w-5 text-primary" />
        </div>
        <div className="p-2 rounded-lg bg-primary/10">
          <Upload className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          Upload Engine Fault Image
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Drag & drop or click to browse
        </p>
      </div>
    </div>
  );
}

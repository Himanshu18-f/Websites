import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { adminCloudinaryUpload, adminResumeUpload } from "~/server/admin";

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  type?: "image" | "raw";
  currentUrl?: string | null;
  label?: string;
  className?: string;
}

export function FileUpload({
  onUpload,
  accept = "image/*",
  type = "image",
  currentUrl,
  label = "Upload File",
  className,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      if (type === "raw") {
        const result = await adminResumeUpload({ file: base64 });
        onUpload(result.url);
      } else {
        const result = await adminCloudinaryUpload({
          file: base64,
          folder: "portfolio",
        });
        onUpload(result.url);
      }
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-white/20 text-sm text-white/50 hover:text-white hover:border-white/40 transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {uploading ? "Uploading..." : label}
      </button>
      {currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-brand-blue hover:underline truncate"
        >
          {currentUrl}
        </a>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { UploadProgress } from "@/lib/multipart-upload";

interface UploadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  progress: UploadProgress | null;
  status: "idle" | "uploading" | "completed" | "error";
  error?: string;
  onCancel?: () => void;
}

export function UploadProgressModal({
  isOpen,
  onClose,
  fileName,
  progress,
  status,
  error,
  onCancel,
}: UploadProgressModalProps) {
  // Prevent closing while uploading
  const canClose = status !== "uploading";

  useEffect(() => {
    // Auto-close after successful upload
    if (status === "completed") {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={canClose ? onClose : undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {status === "uploading" && (
              <>
                <Upload className="h-5 w-5 animate-pulse" />
                Uploading File
              </>
            )}
            {status === "completed" && (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Upload Complete
              </>
            )}
            {status === "error" && (
              <>
                <AlertCircle className="h-5 w-5 text-red-600" />
                Upload Failed
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm truncate">
            {fileName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {status === "uploading" && progress && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>{progress.percentage}%</span>
                </div>
                <Progress value={progress.percentage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium">
                    {formatBytes(progress.uploadedBytes)} / {formatBytes(progress.totalBytes)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Parts</p>
                  <p className="font-medium">
                    {progress.uploadedParts} / {progress.totalParts}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onCancel}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel Upload
                </Button>
              </div>
            </>
          )}

          {status === "completed" && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                File uploaded successfully!
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error || "An error occurred during upload"}</p>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
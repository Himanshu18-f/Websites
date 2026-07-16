import { Button } from "~/components/ui/button";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  variant = "destructive",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative glass max-w-sm w-full p-6 space-y-4">
        <h3 className="text-lg font-display font-semibold">{title}</h3>
        <p className="text-sm text-white/60">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={variant === "destructive" ? "outline" : "default"}
            onClick={onConfirm}
            disabled={loading}
            className={
              variant === "destructive"
                ? "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                : ""
            }
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  draft: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  active: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  disabled: "bg-destructive/15 text-destructive border-destructive/30",
  new: "bg-sky-500/15 text-sky-500 border-sky-500/30",
  won: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  lost: "bg-destructive/15 text-destructive border-destructive/30",
  selected: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = TONES[status.toLowerCase()] ?? "bg-surface-2 text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={cn("capitalize font-medium", tone)}>
      {status}
    </Badge>
  );
}

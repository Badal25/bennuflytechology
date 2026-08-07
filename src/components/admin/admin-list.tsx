import type { ReactNode } from "react";
import { Search, Loader2, Inbox, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AdminToolbar({
  search,
  onSearch,
  placeholder = "Search...",
  children,
  actions,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="pl-8"
          />
        </div>
        {children}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AdminListState({
  loading,
  error,
  empty,
  emptyLabel = "No records found",
}: {
  loading?: boolean;
  error?: Error | null;
  empty?: boolean;
  emptyLabel?: string;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <p className="text-sm">Loading...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-destructive/40 py-16 text-destructive">
        <AlertTriangle className="size-5" />
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }
  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-muted-foreground">
        <Inbox className="size-5" />
        <p className="text-sm">{emptyLabel}</p>
      </div>
    );
  }
  return null;
}

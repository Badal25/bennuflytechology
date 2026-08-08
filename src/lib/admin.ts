import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];

/** Records an audit trail entry. Never blocks the calling mutation on failure. */
export async function logAudit(action: string, module: string, recordId: string | null, description: string) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      action,
      module,
      record_id: recordId,
      description,
      user_id: userData.user?.id ?? null,
    });
  } catch {
    // best-effort only
  }
}

/**
 * Generic CRUD hook over a Supabase table for the admin dashboard.
 * Keeps individual admin route files small and consistent.
 */
export function useResource<T extends TableName>(
  table: T,
  opts?: { orderBy?: string; ascending?: boolean; select?: string },
) {
  const queryClient = useQueryClient();
  const key = [table] as const;

  const listQuery = useQuery({
    queryKey: key,
    queryFn: async () => {
      let q = supabase.from(table).select(opts?.select ?? "*");
      if (opts?.orderBy) q = q.order(opts.orderBy, { ascending: opts.ascending ?? true });
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data as any[];
    },
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: key });
  }

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase.from(table).insert(values).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data: any) => {
      toast.success("Created successfully");
      logAudit("create", table, data?.id ?? null, `Created ${table} record`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { data, error } = await (supabase.from(table) as any)
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data: any) => {
      toast.success("Updated successfully");
      logAudit("update", table, data?.id ?? null, `Updated ${table} record`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from(table) as any).delete().eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: (id: string) => {
      toast.success("Deleted successfully");
      logAudit("delete", table, id, `Deleted ${table} record`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    ...listQuery,
    items: (listQuery.data ?? []) as any[],
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    invalidate,
  };
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function toArray(input: string): string[] {
  return input
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function fromArray(input?: string[] | null): string {
  return (input ?? []).join(", ");
}

export function formatBytes(bytes?: number | null) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Star } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminToolbar, AdminListState } from "@/components/admin/admin-list";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { ResourceDialog } from "@/components/admin/resource-dialog";
import { FormField } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useResource, slugify, toArray, fromArray } from "@/lib/admin";
import { toast } from "sonner";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "array" | "number" | "boolean" | "select" | "date" | "url";
  options?: string[];
  required?: boolean;
  hint?: string;
};

export type CrudConfig = {
  title: string;
  table: any;
  fields: FieldDef[];
  hasStatus?: boolean;
  hasFeatured?: boolean;
  hasSortOrder?: boolean;
  hasSlug?: boolean;
  slugSource?: string;
  titleKey: string;
  searchKeys: string[];
  filterKey?: string;
  filterOptions?: string[];
  extraColumns?: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
};

function emptyForm(fields: FieldDef[]) {
  const obj: Record<string, any> = {};
  for (const f of fields) {
    if (f.type === "boolean") obj[f.key] = false;
    else if (f.type === "array") obj[f.key] = "";
    else obj[f.key] = "";
  }
  return obj;
}

export function SimpleCrudPage({ config }: { config: CrudConfig }) {
  const { items, isLoading, error, create, update, remove, isMutating } = useResource(config.table, {
    orderBy: config.hasSortOrder ? "sort_order" : "created_at",
    ascending: config.hasSortOrder,
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm(config.fields));
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const filtered = useMemo(() => {
    return items.filter((row) => {
      const matchesSearch =
        !search ||
        config.searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(search.toLowerCase()));
      const matchesFilter =
        filter === "all" || !config.filterKey || String(row[config.filterKey]) === filter;
      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter, config]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(config.fields));
    setDialogOpen(true);
  }

  function openEdit(row: any) {
    setEditing(row);
    const next: Record<string, any> = {};
    for (const f of config.fields) {
      if (f.type === "array") next[f.key] = fromArray(row[f.key]);
      else next[f.key] = row[f.key] ?? (f.type === "boolean" ? false : "");
    }
    setForm(next);
    setDialogOpen(true);
  }

  async function handleSubmit() {
    for (const f of config.fields) {
      if (f.required && !String(form[f.key] ?? "").trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    const payload: Record<string, any> = {};
    for (const f of config.fields) {
      if (f.type === "array") payload[f.key] = toArray(form[f.key] ?? "");
      else if (f.type === "number") payload[f.key] = form[f.key] === "" ? null : Number(form[f.key]);
      else payload[f.key] = form[f.key] === "" ? null : form[f.key];
    }
    if (config.hasSlug) {
      const source = config.slugSource ? form[config.slugSource] : form[config.titleKey];
      payload["slug"] = editing?.["slug"] ?? slugify(String(source ?? ""));
    }
    try {
      if (editing) {
        await update({ id: editing.id, values: payload });
      } else {
        if (config.hasStatus) payload["status"] = payload["status"] || "draft";
        await create(payload);
      }
      setDialogOpen(false);
    } catch {
      // handled by hook toast
    }
  }

  async function toggleStatus(row: any) {
    await update({ id: row.id, values: { status: row.status === "published" ? "draft" : "published" } });
  }

  async function toggleFeatured(row: any) {
    await update({ id: row.id, values: { featured: !row.featured } });
  }

  async function move(row: any, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const idx = sorted.findIndex((r) => r.id === row.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      update({ id: row.id, values: { sort_order: other.sort_order ?? 0 } }),
      update({ id: other.id, values: { sort_order: row.sort_order ?? 0 } }),
    ]);
  }

  return (
    <AdminShell title={config.title} breadcrumb={`Admin / ${config.title}`}>
      <div className="space-y-4">
        <AdminToolbar
          search={search}
          onSearch={setSearch}
          placeholder={`Search ${config.title.toLowerCase()}...`}
          actions={
            <Button onClick={openCreate}>
              <Plus className="mr-1.5 size-4" /> New
            </Button>
          }
        >
          {config.filterKey && config.filterOptions && (
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {config.filterOptions.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </AdminToolbar>

        <AdminListState loading={isLoading} error={error as Error | null} empty={!isLoading && filtered.length === 0} />

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{config.fields.find((f) => f.key === config.titleKey)?.label ?? "Title"}</TableHead>
                  {config.extraColumns?.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}
                  {config.hasStatus && <TableHead>Status</TableHead>}
                  {config.hasFeatured && <TableHead>Featured</TableHead>}
                  {config.hasSortOrder && <TableHead>Order</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="max-w-xs truncate font-medium text-foreground">
                      {row[config.titleKey]}
                    </TableCell>
                    {config.extraColumns?.map((c) => (
                      <TableCell key={c.key}>{c.render ? c.render(row) : row[c.key]}</TableCell>
                    ))}
                    {config.hasStatus && (
                      <TableCell>
                        <button onClick={() => toggleStatus(row)}>
                          <StatusBadge status={row.status} />
                        </button>
                      </TableCell>
                    )}
                    {config.hasFeatured && (
                      <TableCell>
                        <button onClick={() => toggleFeatured(row)}>
                          <Star className={`size-4 ${row.featured ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                        </button>
                      </TableCell>
                    )}
                    {config.hasSortOrder && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="size-6" onClick={() => move(row, -1)}>
                            <ArrowUp className="size-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-6" onClick={() => move(row, 1)}>
                            <ArrowDown className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(row)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ResourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? `Edit ${config.title.slice(0, -1)}` : `New ${config.title.slice(0, -1)}`}
        onSubmit={handleSubmit}
        submitting={isMutating}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {config.fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" || f.type === "array" ? "sm:col-span-2" : ""}>
              <FormField label={f.label} required={f.required} hint={f.hint}>
                {f.type === "textarea" || f.type === "array" ? (
                  <Textarea
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                    rows={f.type === "array" ? 3 : 4}
                  />
                ) : f.type === "boolean" ? (
                  <Switch checked={!!form[f.key]} onCheckedChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} />
                ) : f.type === "select" && f.options ? (
                  <Select value={form[f.key] ?? ""} onValueChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                  />
                )}
              </FormField>
            </div>
          ))}
        </div>
      </ResourceDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title={`Delete ${config.title.slice(0, -1)}?`}
        description="This action is permanent and cannot be undone."
        onConfirm={async () => {
          if (deleteTarget) await remove(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </AdminShell>
  );
}

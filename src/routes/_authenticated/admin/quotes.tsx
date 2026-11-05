import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminToolbar, AdminListState } from "@/components/admin/admin-list";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ResourceDialog } from "@/components/admin/resource-dialog";
import { FormField } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useResource, fromArray, toArray } from "@/lib/admin";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/quotes")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: QuotesPage,
});

const emptyForm = { project_type: "", services: "", budget: "", timeline: "", description: "" };

function QuotesPage() {
  const { items, isLoading, error, update, remove, isMutating } = useResource("quote_requests", {
    orderBy: "created_at",
    ascending: false,
    select: "*, leads(name,email,company,status)",
  });
  const [search, setSearch] = useState("");
  const [budget, setBudget] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const budgetOptions = useMemo(
    () => Array.from(new Set(items.map((i) => i.budget).filter(Boolean))) as string[],
    [items],
  );

  const filtered = useMemo(
    () =>
      items.filter((r) => {
        const s = search.toLowerCase();
        const leadName = r.leads?.name ?? "";
        const matches =
          !s ||
          [leadName, r.leads?.email, r.leads?.company, r.project_type, r.budget, r.description].some((v) =>
            String(v ?? "").toLowerCase().includes(s),
          );
        return matches && (budget === "all" || r.budget === budget);
      }),
    [items, search, budget],
  );

  function openEdit(row: any) {
    setEditing(row);
    setForm({
      project_type: row.project_type ?? "",
      services: fromArray(row.services ?? []),
      budget: row.budget ?? "",
      timeline: row.timeline ?? "",
      description: row.description ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!form.description?.trim()) {
      toast.error("Project description is required");
      return;
    }
    await update({
      id: editing.id,
      values: {
        project_type: form.project_type || null,
        services: toArray(form.services ?? ""),
        budget: form.budget || null,
        timeline: form.timeline || null,
        description: form.description,
      },
    });
    setDialogOpen(false);
  }

  return (
    <AdminShell title="Quote Requests" breadcrumb="Admin / Quote Requests">
      <div className="space-y-4">
        <AdminToolbar search={search} onSearch={setSearch} placeholder="Search quotes...">
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All budgets</SelectItem>
              {budgetOptions.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminToolbar>

        <AdminListState
          loading={isLoading}
          error={error as Error | null}
          empty={!isLoading && filtered.length === 0}
          emptyLabel="No quote requests yet"
        />

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Project Type</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{r.leads?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.leads?.email ?? "—"}
                        {r.leads?.company ? ` · ${r.leads.company}` : ""}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{r.project_type || "—"}</TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="flex flex-wrap gap-1">
                        {(r.services ?? []).slice(0, 3).map((s: string) => (
                          <Badge key={s} variant="outline" className="text-[10px]">
                            {s}
                          </Badge>
                        ))}
                        {(r.services ?? []).length > 3 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{(r.services ?? []).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{r.budget || "—"}</TableCell>
                    <TableCell className="text-sm">{r.timeline || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(r.created_at), "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" title="View details" onClick={() => setSelected(r)}>
                          <Eye className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Edit quote" onClick={() => openEdit(r)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Delete quote"
                          onClick={() => setDeleteTarget(r)}
                        >
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

      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selected?.leads?.name ?? "Quote request"}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="space-y-4 p-4 text-sm">
              <Detail label="Email" value={selected.leads?.email} />
              <Detail label="Company" value={selected.leads?.company} />
              <Detail label="Project type" value={selected.project_type} />
              {!!selected.services?.length && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Services</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selected.services.map((s: string) => (
                      <Badge key={s} variant="outline">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <Detail label="Budget" value={selected.budget} />
              <Detail label="Timeline" value={selected.timeline} />
              <Detail label="Description" value={selected.description} />
              {selected.attachment_path && <Detail label="Attachment" value={selected.attachment_path} />}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ResourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Edit Quote Request"
        onSubmit={handleSubmit}
        submitting={isMutating}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Project Type">
            <Input
              value={form.project_type}
              onChange={(e) => setForm((s) => ({ ...s, project_type: e.target.value }))}
            />
          </FormField>
          <FormField label="Budget">
            <Input value={form.budget} onChange={(e) => setForm((s) => ({ ...s, budget: e.target.value }))} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Services" hint="Comma or newline separated">
              <Textarea
                rows={3}
                value={form.services}
                onChange={(e) => setForm((s) => ({ ...s, services: e.target.value }))}
              />
            </FormField>
          </div>
          <FormField label="Timeline">
            <Input value={form.timeline} onChange={(e) => setForm((s) => ({ ...s, timeline: e.target.value }))} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Description" required>
              <Textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              />
            </FormField>
          </div>
        </div>
      </ResourceDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete quote request?"
        description="This permanently removes the quote request. The linked lead stays in Leads."
        onConfirm={async () => {
          if (deleteTarget) await remove(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </AdminShell>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="whitespace-pre-wrap break-words text-foreground">{value}</p>
    </div>
  );
}

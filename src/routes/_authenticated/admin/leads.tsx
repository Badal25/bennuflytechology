import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminToolbar, AdminListState } from "@/components/admin/admin-list";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useResource } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: LeadsPage,
});

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];

function LeadsPage() {
  const { items, isLoading, error, update, remove } = useResource("leads", {
    orderBy: "created_at",
    ascending: false,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [selected, setSelected] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const sources = useMemo(
    () => Array.from(new Set(items.map((i) => i.source).filter(Boolean))) as string[],
    [items],
  );

  const filtered = useMemo(
    () =>
      items.filter((r) => {
        const s = search.toLowerCase();
        const matches =
          !s || [r.name, r.email, r.company, r.phone, r.service].some((v) => String(v ?? "").toLowerCase().includes(s));
        return matches && (status === "all" || r.status === status) && (source === "all" || r.source === source);
      }),
    [items, search, status, source],
  );

  return (
    <AdminShell title="Leads" breadcrumb="Admin / Leads">
      <div className="space-y-4">
        <AdminToolbar search={search} onSearch={setSearch} placeholder="Search leads...">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </AdminToolbar>

        <AdminListState loading={isLoading} error={error as Error | null} empty={!isLoading && filtered.length === 0} emptyLabel="No leads yet" />

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.email}{r.phone ? ` · ${r.phone}` : ""}</p>
                    </TableCell>
                    <TableCell className="text-sm">{r.company || "—"}</TableCell>
                    <TableCell className="text-sm">{r.service || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{r.source}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(r.created_at), "d MMM yyyy")}</TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v) => update({ id: r.id, values: { status: v } })}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => { setSelected(r); setNotes(r.internal_notes ?? ""); }}>
                          <Eye className="mr-1 size-3.5" /> View
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(r)}>
                          Delete
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
          <SheetHeader><SheetTitle>{selected?.name}</SheetTitle></SheetHeader>
          {selected && (
            <div className="space-y-4 p-4 text-sm">
              <Detail label="Email" value={selected.email} />
              <Detail label="Phone" value={selected.phone} />
              <Detail label="Company" value={selected.company} />
              <Detail label="Service" value={selected.service} />
              <Detail label="Budget" value={selected.budget} />
              <Detail label="Timeline" value={selected.timeline} />
              <Detail label="Message" value={selected.message} />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Internal notes</p>
                <Textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} />
                <Button size="sm" onClick={async () => { await update({ id: selected.id, values: { internal_notes: notes } }); setSelected(null); }}>
                  Save notes
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete lead?"
        description="This permanently removes the lead and its notes."
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

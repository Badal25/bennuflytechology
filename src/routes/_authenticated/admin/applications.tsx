import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { FileDown, Eye, Download } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminToolbar, AdminListState } from "@/components/admin/admin-list";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useResource } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/applications")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: ApplicationsPage,
});

const STATUSES = ["NEW", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"];

function ApplicationsPage() {
  const { items, isLoading, error, update, remove } = useResource("job_applications", {
    orderBy: "created_at",
    ascending: false,
  });
  const jobsQuery = useQuery({
    queryKey: ["jobs-lite"],
    queryFn: async () => {
      const { data, error: e } = await supabase.from("jobs").select("id, title");
      if (e) throw new Error(e.message);
      return data ?? [];
    },
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [job, setJob] = useState("all");
  const [selected, setSelected] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const jobTitle = (id: string | null) =>
    (jobsQuery.data ?? []).find((j) => j.id === id)?.title ?? "—";

  const filtered = useMemo(
    () =>
      items.filter((r) => {
        const s = search.toLowerCase();
        const matches =
          !s ||
          [r.full_name, r.email, r.phone, r.position, r.application_number].some((v) => String(v ?? "").toLowerCase().includes(s));
        return (
          matches &&
          (status === "all" || r.status === status) &&
          (job === "all" || r.job_id === job)
        );
      }),
    [items, search, status, job],
  );

  function exportExcel() {
    const cols: [string, (r: any) => unknown][] = [
      ["Application ID", (r) => r.application_number],
      ["Full Name", (r) => r.full_name],
      ["Email", (r) => r.email],
      ["Phone", (r) => r.phone],
      ["Applied Job", (r) => (r.job_id ? jobTitle(r.job_id) : r.position)],
      ["Location", (r) => r.location],
      ["Experience", (r) => r.experience],
      ["Education", (r) => r.education],
      ["Skills", (r) => r.skills],
      ["LinkedIn", (r) => r.linkedin_url],
      ["GitHub", (r) => r.github_url],
      ["Portfolio", (r) => r.portfolio_url],
      ["Status", (r) => r.status],
      ["Applied Date", (r) => format(new Date(r.created_at), "yyyy-MM-dd HH:mm")],
      ["Cover Letter", (r) => r.cover_letter],
      ["Internal Notes", (r) => r.internal_notes],
    ];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.map((c) => esc(c[0])).join(","), ...filtered.map((r) => cols.map((c) => esc(c[1](r))).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bennufly-job-applications-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Exported ${filtered.length} applications`);
  }

  async function openResume(path: string) {
    const { data, error: e } = await supabase.storage.from("resumes").createSignedUrl(path, 60);
    if (e || !data) {
      toast.error(e?.message ?? "Could not open resume");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <AdminShell title="Applications" breadcrumb="Admin / Applications">
      <div className="space-y-4">
        <AdminToolbar search={search} onSearch={setSearch} placeholder="Search candidates or ID...">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={job} onValueChange={setJob}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All jobs</SelectItem>
              {(jobsQuery.data ?? []).map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportExcel} disabled={filtered.length === 0}>
            <Download className="mr-1 size-4" /> Export to Excel
          </Button>
        </AdminToolbar>

        <AdminListState loading={isLoading} error={error as Error | null} empty={!isLoading && filtered.length === 0} emptyLabel="No applications yet" />

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Applied Job</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{r.full_name}</p>
                      <p className="text-xs text-muted-foreground">{r.email}{r.phone ? ` · ${r.phone}` : ""}</p>
                      {r.application_number && <p className="font-mono text-xs text-brand">{r.application_number}</p>}
                    </TableCell>
                    <TableCell className="text-sm">{r.job_id ? jobTitle(r.job_id) : r.position || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.experience || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(r.created_at), "d MMM yyyy")}</TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v) => update({ id: r.id, values: { status: v } })}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
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
                        {r.resume_path && (
                          <Button size="sm" variant="ghost" onClick={() => openResume(r.resume_path)}>
                            <FileDown className="mr-1 size-3.5" /> Resume
                          </Button>
                        )}
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
          <SheetHeader><SheetTitle>{selected?.full_name}</SheetTitle></SheetHeader>
          {selected && (
            <div className="space-y-4 p-4 text-sm">
              <Badge variant="secondary">{selected.status}</Badge>
              <Detail label="Email" value={selected.email} />
              <Detail label="Phone" value={selected.phone} />
              <Detail label="Location" value={selected.location} />
              <Detail label="Position" value={selected.position} />
              <Detail label="Experience" value={selected.experience} />
              <Detail label="Education" value={selected.education} />
              <Detail label="Skills" value={selected.skills} />
              <Detail label="LinkedIn" value={selected.linkedin_url} />
              <Detail label="GitHub" value={selected.github_url} />
              <Detail label="Portfolio" value={selected.portfolio_url} />
              <Detail label="Cover letter" value={selected.cover_letter} />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Internal notes</p>
                <Textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} />
                <Button
                  size="sm"
                  onClick={async () => {
                    await update({ id: selected.id, values: { internal_notes: notes } });
                    setSelected(null);
                  }}
                >
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
        title="Delete application?"
        description="The candidate record and its reference to the stored resume will be removed."
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

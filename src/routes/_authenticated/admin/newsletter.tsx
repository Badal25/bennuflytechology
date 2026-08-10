import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Download, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminToolbar, AdminListState } from "@/components/admin/admin-list";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useResource } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/newsletter")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: NewsletterPage,
});

function NewsletterPage() {
  const { items, isLoading, error, remove } = useResource("newsletter_subscribers", {
    orderBy: "subscribed_at",
    ascending: false,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const filtered = useMemo(
    () =>
      items.filter(
        (r) =>
          (!search ||
            [r.email, r.name].some((v) => String(v ?? "").toLowerCase().includes(search.toLowerCase()))) &&
          (status === "all" || r.status === status),
      ),
    [items, search, status],
  );

  function exportCsv() {
    const rows = [
      ["Email", "Name", "Status", "Subscribed at"],
      ...filtered.map((r) => [r.email, r.name ?? "", r.status, r.subscribed_at]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `bennufly-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminShell title="Newsletter" breadcrumb="Admin / Newsletter">
      <div className="space-y-4">
        <AdminToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search subscribers..."
          actions={
            <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}>
              <Download className="mr-1.5 size-4" /> Export CSV
            </Button>
          }
        >
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            </SelectContent>
          </Select>
        </AdminToolbar>

        <p className="text-xs text-muted-foreground">Email delivery provider not configured.</p>

        <AdminListState loading={isLoading} error={error as Error | null} empty={!isLoading && filtered.length === 0} emptyLabel="No subscribers yet" />

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-foreground">{r.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.name || "—"}</TableCell>
                    <TableCell><Badge variant={r.status === "active" ? "secondary" : "outline"}>{r.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(r.subscribed_at), "d MMM yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(r)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Remove subscriber?"
        description="This deletes the subscriber record permanently."
        onConfirm={async () => {
          if (deleteTarget) await remove(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </AdminShell>
  );
}

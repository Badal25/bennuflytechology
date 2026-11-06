import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Award, Eye, FileDown } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminToolbar, AdminListState } from "@/components/admin/admin-list";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { SimpleCrudPage, type CrudConfig } from "@/components/admin/simple-crud-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useResource } from "@/lib/admin";
import { useServerFn } from "@tanstack/react-start";
import { sendApplicationStatusEmail } from "@/lib/status-email.functions";
import { useAuth } from "@/hooks/use-auth";
import {
  INTERNSHIP_APPLICATION_STATUSES,
  PROGRAM_TYPES,
  RESOURCE_TYPES,
  WORK_MODES,
  DIFFICULTIES,
} from "@/lib/learning";

export const Route = createFileRoute("/_authenticated/admin/learning")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: LearningAdminPage,
});

const programConfig: CrudConfig = {
  title: "Programs",
  table: "learning_programs",
  titleKey: "name",
  hasStatus: true,
  hasFeatured: true,
  hasSlug: true,
  hasSortOrder: true,
  embedded: true,
  searchKeys: ["name", "category", "description", "eligibility"],
  filterKey: "program_type",
  filterOptions: [...PROGRAM_TYPES],
  extraColumns: [
    { key: "category", label: "Category" },
    { key: "program_type", label: "Type" },
    { key: "mode", label: "Mode" },
    { key: "duration", label: "Duration" },
  ],
  fields: [
    { key: "name", label: "Program Name", type: "text", required: true },
    { key: "category", label: "Category", type: "text", hint: "Match a learning category name" },
    { key: "program_type", label: "Program Type", type: "select", options: [...PROGRAM_TYPES], required: true },
    { key: "mode", label: "Mode", type: "select", options: [...WORK_MODES], required: true },
    { key: "duration", label: "Duration", type: "text", hint: "e.g. 8 weeks" },
    { key: "seats", label: "Available Seats", type: "number" },
    { key: "start_date", label: "Start Date", type: "date" },
    { key: "application_deadline", label: "Application Deadline", type: "date" },
    { key: "thumbnail", label: "Thumbnail URL", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "eligibility", label: "Eligibility", type: "textarea" },
    { key: "skills", label: "Skills Covered", type: "array", hint: "Comma or newline separated" },
  ],
};

const resourceConfig: CrudConfig = {
  title: "Resources",
  table: "learning_resources",
  titleKey: "title",
  hasStatus: true,
  hasSlug: true,
  hasSortOrder: true,
  embedded: true,
  searchKeys: ["title", "category", "description"],
  filterKey: "resource_type",
  filterOptions: [...RESOURCE_TYPES],
  extraColumns: [
    { key: "category", label: "Category" },
    { key: "resource_type", label: "Type" },
    { key: "difficulty", label: "Difficulty" },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "category", label: "Category", type: "text" },
    { key: "resource_type", label: "Resource Type", type: "select", options: [...RESOURCE_TYPES], required: true },
    { key: "difficulty", label: "Difficulty", type: "select", options: [...DIFFICULTIES], required: true },
    { key: "thumbnail", label: "Thumbnail URL", type: "text" },
    { key: "url", label: "External URL", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "content", label: "Content", type: "textarea" },
  ],
};

const categoryConfig: CrudConfig = {
  title: "Categories",
  table: "learning_categories",
  titleKey: "name",
  hasStatus: true,
  hasSlug: true,
  hasSortOrder: true,
  embedded: true,
  searchKeys: ["name", "description"],
  fields: [
    { key: "name", label: "Category Name", type: "text", required: true },
    { key: "icon", label: "Icon", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
  ],
};

const certificateConfig: CrudConfig = {
  title: "Certificates",
  table: "certificates",
  titleKey: "recipient_name",
  embedded: true,
  searchKeys: ["certificate_id", "recipient_name", "recipient_email", "program_name"],
  filterKey: "status",
  filterOptions: ["valid", "revoked"],
  extraColumns: [
    { key: "certificate_id", label: "Certificate ID" },
    { key: "program_name", label: "Program" },
    { key: "issue_date", label: "Issued" },
    { key: "status", label: "Status" },
  ],
  fields: [
    { key: "recipient_name", label: "Recipient Name", type: "text", required: true },
    { key: "recipient_email", label: "Recipient Email", type: "text" },
    { key: "program_name", label: "Program Name", type: "text", required: true },
    { key: "domain", label: "Domain", type: "text" },
    { key: "duration", label: "Duration", type: "text", hint: "e.g. 8 weeks" },
    { key: "start_date", label: "Start Date", type: "date" },
    { key: "end_date", label: "End Date", type: "date" },
    { key: "issue_date", label: "Issue Date", type: "date" },
    { key: "performance", label: "Performance / Grade", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["valid", "revoked"], required: true },
    { key: "certificate_id", label: "Certificate ID", type: "text", hint: "Leave empty to auto-generate (BNF-CERT-YYYY-XXXXXX)" },
    { key: "notes", label: "Internal Notes", type: "textarea" },
  ],
};

function LearningAdminPage() {
  const { isSuperAdmin, roles } = useAuth();
  const canContent = isSuperAdmin || roles.includes("content_manager");
  const canHr = isSuperAdmin || roles.includes("hr");
  const defaultTab = canContent ? "programs" : "applications";

  return (
    <AdminShell title="Learning & Internships" breadcrumb="Admin / Learning & Internships">
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          {canContent && <TabsTrigger value="programs">Programs</TabsTrigger>}
          {canHr && <TabsTrigger value="applications">Applications</TabsTrigger>}
          {canContent && <TabsTrigger value="resources">Learning Resources</TabsTrigger>}
          {canContent && <TabsTrigger value="categories">Categories</TabsTrigger>}
          {canHr && <TabsTrigger value="certificates">Certificates</TabsTrigger>}
        </TabsList>
        {canHr && (
          <TabsContent value="certificates">
            <SimpleCrudPage config={certificateConfig} />
          </TabsContent>
        )}

        {canContent && (
          <TabsContent value="programs">
            <SimpleCrudPage config={programConfig} />
          </TabsContent>
        )}
        {canHr && (
          <TabsContent value="applications">
            <InternshipApplications />
          </TabsContent>
        )}
        {canContent && (
          <TabsContent value="resources">
            <SimpleCrudPage config={resourceConfig} />
          </TabsContent>
        )}
        {canContent && (
          <TabsContent value="categories">
            <SimpleCrudPage config={categoryConfig} />
          </TabsContent>
        )}
      </Tabs>
    </AdminShell>
  );
}

function InternshipApplications() {
  const { items, isLoading, error, update, remove } = useResource("internship_applications", {
    orderBy: "created_at",
    ascending: false,
  });
  const programsQuery = useQuery({
    queryKey: ["learning_programs-lite"],
    queryFn: async () => {
      const { data, error: e } = await supabase.from("learning_programs").select("id, name, duration");
      if (e) throw new Error(e.message);
      return data ?? [];
    },
  });

  const sendStatusEmail = useServerFn(sendApplicationStatusEmail);
  const changeStatus = async (id: string, status: string) => {
    try {
      await update({ id, values: { status } });
    } catch {
      return;
    }
    try {
      const r = await sendStatusEmail({ data: { kind: "internship", id } });
      if (r.sent) toast.success(`Status saved · email sent to applicant`);
      else toast.warning(`Status saved · email not sent: ${r.reason}`);
    } catch {
      toast.warning("Status saved · email could not be sent");
    }
  };
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [program, setProgram] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const programName = (row: any) =>
    (programsQuery.data ?? []).find((p) => p.id === row.program_id)?.name ?? row.program_name ?? "General application";

  const filtered = useMemo(
    () =>
      items.filter((r) => {
        const s = search.trim().toLowerCase();
        const matchesSearch =
          !s || [r.full_name, r.email, r.college, r.application_number].some((v) => String(v ?? "").toLowerCase().includes(s));
        const created = new Date(r.created_at).getTime();
        const afterFrom = !from || created >= new Date(`${from}T00:00:00`).getTime();
        const beforeTo = !to || created <= new Date(`${to}T23:59:59`).getTime();
        return (
          matchesSearch &&
          (status === "all" || r.status === status) &&
          (program === "all" || r.program_id === program) &&
          afterFrom &&
          beforeTo
        );
      }),
    [items, search, status, program, from, to],
  );

  async function issueCertificate(row: any) {
    const { data: existing } = await (supabase.from as any)("certificates")
      .select("certificate_id").eq("application_id", row.id).maybeSingle();
    if (existing) {
      toast.info(`Certificate already issued: ${existing.certificate_id}`);
      return;
    }
    const prog = (programsQuery.data ?? []).find((p: any) => p.id === row.program_id) as any;
    const { data, error: e } = await (supabase.from as any)("certificates")
      .insert({
        application_id: row.id,
        recipient_name: row.full_name,
        recipient_email: row.email,
        program_name: programName(row),
        domain: row.interested_domain,
        duration: prog?.duration ?? null,
        status: "valid",
      })
      .select("certificate_id")
      .single();
    if (e) {
      toast.error(e.message);
      return;
    }
    if (row.status !== "Completed") await update({ id: row.id, values: { status: "Completed" } });
    navigator.clipboard?.writeText(`${window.location.origin}/verify?cert=${data.certificate_id}`);
    toast.success(`Certificate ${data.certificate_id} issued. Verification link copied.`);
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
    <div className="space-y-4">
      <AdminToolbar search={search} onSearch={setSearch} placeholder="Search name, email, college or application ID...">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {INTERNSHIP_APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={program} onValueChange={setProgram}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All programs</SelectItem>
            {(programsQuery.data ?? []).map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" aria-label="From date" className="w-40" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" aria-label="To date" className="w-40" value={to} onChange={(e) => setTo(e.target.value)} />
      </AdminToolbar>

      <AdminListState loading={isLoading} error={error as Error | null} empty={!isLoading && filtered.length === 0} />

      {!isLoading && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>College / Course</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{r.full_name}</p>
                    {r.application_number && <p className="font-mono text-[11px] text-brand">{r.application_number}</p>}
                    <p className="text-xs text-muted-foreground">
                      {r.email}
                      {r.phone ? ` · ${r.phone}` : ""}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">
                    <p>{r.college || "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {[r.course, r.graduation_year].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">
                    <p>{programName(r)}</p>
                    <p className="text-xs text-muted-foreground">{r.interested_domain || "—"}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(r.created_at), "d MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => changeStatus(r.id, v)}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INTERNSHIP_APPLICATION_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
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

      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader><SheetTitle>{selected?.full_name}</SheetTitle></SheetHeader>
          {selected && (
            <div className="space-y-4 p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{selected.status}</Badge>
                {selected.application_number && <Badge variant="outline">{selected.application_number}</Badge>}
              </div>
              {(selected.status === "Completed" || selected.status === "Active") && (
                <Button size="sm" variant="outline" onClick={() => issueCertificate(selected)}>
                  <Award className="mr-1 size-3.5" /> Issue certificate
                </Button>
              )}
              <Detail label="Email" value={selected.email} />
              <Detail label="Phone" value={selected.phone} />
              <Detail label="College / University" value={selected.college} />
              <Detail label="Course" value={selected.course} />
              <Detail label="Graduation year" value={selected.graduation_year} />
              <Detail label="Applied program" value={programName(selected)} />
              <Detail label="Interested domain" value={selected.interested_domain} />
              <Detail label="Skills" value={selected.skills} />
              <Detail label="LinkedIn" value={selected.linkedin_url} />
              <Detail label="GitHub" value={selected.github_url} />
              <Detail label="Portfolio" value={selected.portfolio_url} />
              <Detail label="Why they want to join" value={selected.motivation} />
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
        title="Delete internship application?"
        description="The student record and its reference to the stored resume will be permanently removed."
        onConfirm={async () => {
          if (deleteTarget) await remove(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
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

import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Upload, Copy, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminToolbar, AdminListState } from "@/components/admin/admin-list";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useResource, formatBytes } from "@/lib/admin";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/media")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: MediaPage,
});

function typeGroup(mime?: string | null) {
  if (!mime) return "Other";
  if (mime.startsWith("image/")) return "Image";
  if (mime === "application/pdf") return "PDF";
  return "Document";
}

function MediaPage() {
  const { items, isLoading, error, create, remove, invalidate } = useResource("media", {
    orderBy: "created_at",
    ascending: false,
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      items.filter(
        (r) =>
          (!search || String(r.file_name ?? "").toLowerCase().includes(search.toLowerCase())) &&
          (filter === "all" || typeGroup(r.file_type) === filter),
      ),
    [items, search, filter],
  );

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`${file.name} exceeds the 20MB limit`);
          continue;
        }
        const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
        const { error: upErr } = await supabase.storage
          .from("media")
          .upload(path, file, { contentType: file.type || "application/octet-stream" });
        if (upErr) {
          toast.error(upErr.message);
          continue;
        }
        const { data: userData } = await supabase.auth.getUser();
        await create({
          file_name: file.name,
          file_path: path,
          file_type: file.type || null,
          file_size: file.size,
          uploaded_by: userData.user?.id ?? null,
        });
      }
      invalidate();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function openFile(path: string) {
    const { data, error: e } = await supabase.storage.from("media").createSignedUrl(path, 300);
    if (e || !data) {
      toast.error(e?.message ?? "Could not open file");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function copyRef(path: string) {
    const { data, error: e } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 7);
    if (e || !data) {
      toast.error(e?.message ?? "Could not create link");
      return;
    }
    await navigator.clipboard.writeText(data.signedUrl);
    toast.success("Signed URL copied (valid 7 days)");
  }

  return (
    <AdminShell title="Media Library" breadcrumb="Admin / Media">
      <div className="space-y-4">
        <AdminToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search files..."
          actions={
            <>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Upload className="mr-1.5 size-4" />}
                Upload
              </Button>
            </>
          }
        >
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Image">Images</SelectItem>
              <SelectItem value="PDF">PDFs</SelectItem>
              <SelectItem value="Document">Documents</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </AdminToolbar>

        <p className="text-xs text-muted-foreground">
          Files are stored in private storage. Sharing uses time-limited signed links — resumes and confidential
          documents are never publicly accessible.
        </p>

        <AdminListState loading={isLoading} error={error as Error | null} empty={!isLoading && filtered.length === 0} emptyLabel="No files uploaded yet" />

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-xs truncate font-medium text-foreground">{r.file_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{typeGroup(r.file_type)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatBytes(r.file_size)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(r.created_at), "d MMM yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openFile(r.file_path)}>
                          <ExternalLink className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => copyRef(r.file_path)}>
                          <Copy className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(r)}>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete file?"
        description="The file is removed from storage and the library."
        onConfirm={async () => {
          if (deleteTarget) {
            await supabase.storage.from("media").remove([deleteTarget.file_path]);
            await remove(deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
      />
    </AdminShell>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminListState } from "@/components/admin/admin-list";
import { FormField } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: SeoPage,
});

const PAGES = [
  "home", "about", "services", "portfolio", "technologies", "process", "industries",
  "careers", "learning", "blog", "contact", "start-project", "privacy", "terms",
];

type SeoForm = {
  seo_title: string;
  seo_description: string;
  keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
  no_index: boolean;
  no_follow: boolean;
};

const EMPTY: SeoForm = {
  seo_title: "", seo_description: "", keywords: "", og_title: "", og_description: "",
  og_image: "", canonical_url: "", no_index: false, no_follow: false,
};

function SeoPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState("home");
  const [form, setForm] = useState<SeoForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["seo_settings"],
    queryFn: async () => {
      const { data: rows, error: e } = await supabase.from("seo_settings").select("*");
      if (e) throw new Error(e.message);
      return rows ?? [];
    },
  });

  useEffect(() => {
    const row = (data ?? []).find((r) => r.page === page);
    setForm(
      row
        ? {
            seo_title: row.seo_title ?? "",
            seo_description: row.seo_description ?? "",
            keywords: row.keywords ?? "",
            og_title: (row as any).og_title ?? "",
            og_description: (row as any).og_description ?? "",
            og_image: row.og_image ?? "",
            canonical_url: row.canonical_url ?? "",
            no_index: Boolean((row as any).no_index),
            no_follow: Boolean((row as any).no_follow),
          }
        : EMPTY,
    );
  }, [page, data]);

  async function save() {
    setSaving(true);
    const { error: e } = await supabase
      .from("seo_settings")
      .upsert({ page, ...form, updated_at: new Date().toISOString() } as any, { onConflict: "page" });
    setSaving(false);
    if (e) return toast.error(e.message);
    toast.success("SEO settings saved");
    logAudit("update", "seo_settings", null, `Updated SEO for ${page}`);
    queryClient.invalidateQueries({ queryKey: ["seo_settings"] });
  }

  return (
    <AdminShell title="SEO" breadcrumb="Admin / SEO">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Select value={page} onValueChange={setPage}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAGES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={save} disabled={saving || isLoading}>
            {saving ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Save className="mr-1.5 size-4" />}
            Save
          </Button>
        </div>

        <AdminListState loading={isLoading} error={error as Error | null} />

        {!isLoading && (
          <Card>
            <CardHeader><CardTitle className="text-base capitalize">{page} page metadata</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField label="SEO Title">
                <Input value={form.seo_title} onChange={(e) => setForm((s) => ({ ...s, seo_title: e.target.value }))} />
              </FormField>
              <FormField label="Canonical URL">
                <Input value={form.canonical_url} onChange={(e) => setForm((s) => ({ ...s, canonical_url: e.target.value }))} />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Meta Description">
                  <Textarea rows={3} value={form.seo_description} onChange={(e) => setForm((s) => ({ ...s, seo_description: e.target.value }))} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Keywords" hint="Comma separated">
                  <Input value={form.keywords} onChange={(e) => setForm((s) => ({ ...s, keywords: e.target.value }))} />
                </FormField>
              </div>
              <FormField label="OG Title">
                <Input value={form.og_title} onChange={(e) => setForm((s) => ({ ...s, og_title: e.target.value }))} />
              </FormField>
              <FormField label="OG Image URL">
                <Input value={form.og_image} onChange={(e) => setForm((s) => ({ ...s, og_image: e.target.value }))} />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="OG Description">
                  <Textarea rows={3} value={form.og_description} onChange={(e) => setForm((s) => ({ ...s, og_description: e.target.value }))} />
                </FormField>
              </div>
              <FormField label="Noindex">
                <Switch checked={form.no_index} onCheckedChange={(v) => setForm((s) => ({ ...s, no_index: v }))} />
              </FormField>
              <FormField label="Nofollow">
                <Switch checked={form.no_follow} onCheckedChange={(v) => setForm((s) => ({ ...s, no_follow: v }))} />
              </FormField>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}

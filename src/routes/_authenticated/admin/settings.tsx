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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

const SECTIONS: { title: string; fields: { key: string; label: string; type?: "textarea" }[] }[] = [
  {
    title: "Company",
    fields: [
      { key: "company_name", label: "Company Name" },
      { key: "tagline", label: "Tagline" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "whatsapp", label: "WhatsApp Number" },
      { key: "whatsapp_message", label: "WhatsApp Prefilled Message" },
      { key: "working_hours", label: "Working Hours" },
      { key: "address", label: "Address", type: "textarea" },
    ],
  },
  {
    title: "Social",
    fields: [
      { key: "linkedin", label: "LinkedIn" },
      { key: "instagram", label: "Instagram" },
      { key: "github", label: "GitHub" },
      { key: "facebook", label: "Facebook" },
      { key: "youtube", label: "YouTube" },
      { key: "twitter_x", label: "X (Twitter)" },
    ],
  },
  {
    title: "Website & Branding",
    fields: [
      { key: "website_url", label: "Website URL" },
      { key: "logo", label: "Logo URL" },
      { key: "favicon", label: "Favicon URL" },
      { key: "default_seo_title", label: "Default SEO Title" },
      { key: "default_og_image", label: "Default OG Image URL" },
      { key: "default_seo_description", label: "Default SEO Description", type: "textarea" },
      { key: "footer_text", label: "Footer Text", type: "textarea" },
      { key: "copyright", label: "Copyright" },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "google_maps_url", label: "Google Maps URL" },
      { key: "booking_url", label: "Booking URL" },
    ],
  },
];

function SettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["website_settings_admin"],
    queryFn: async () => {
      const { data: row, error: e } = await supabase.from("website_settings").select("*").maybeSingle();
      if (e) throw new Error(e.message);
      return row;
    },
  });

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const s of SECTIONS) for (const f of s.fields) next[f.key] = (data as any)[f.key] ?? "";
    setForm(next);
  }, [data]);

  async function save() {
    setSaving(true);
    const values: Record<string, string | null> = {};
    for (const s of SECTIONS) for (const f of s.fields) values[f.key] = form[f.key]?.trim() ? form[f.key]! : null;
    const payload = { ...values, company_name: form["company_name"] || "Bennufly Technology Pvt. Ltd.", updated_at: new Date().toISOString() };
    const { error: e } = data
      ? await (supabase.from("website_settings") as any).update(payload).eq("id", (data as any).id)
      : await (supabase.from("website_settings") as any).insert(payload);
    setSaving(false);
    if (e) return toast.error(e.message);
    toast.success("Settings saved");
    logAudit("update", "website_settings", (data as any)?.id ?? null, "Updated website settings");
    queryClient.invalidateQueries({ queryKey: ["website_settings_admin"] });
    queryClient.invalidateQueries({ queryKey: ["website_settings"] });
  }

  return (
    <AdminShell title="Settings" breadcrumb="Admin / Settings">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving || isLoading}>
            {saving ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Save className="mr-1.5 size-4" />}
            Save changes
          </Button>
        </div>

        <AdminListState loading={isLoading} error={error as Error | null} />

        {!isLoading &&
          SECTIONS.map((section) => (
            <Card key={section.title}>
              <CardHeader><CardTitle className="text-base">{section.title}</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {section.fields.map((f) => (
                  <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                    <FormField label={f.label}>
                      {f.type === "textarea" ? (
                        <Textarea rows={3} value={form[f.key] ?? ""} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} />
                      ) : (
                        <Input value={form[f.key] ?? ""} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} />
                      )}
                    </FormField>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
      </div>
    </AdminShell>
  );
}

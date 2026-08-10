import { createFileRoute } from "@tanstack/react-router";
import { SimpleCrudPage, type CrudConfig } from "@/components/admin/simple-crud-page";

export const Route = createFileRoute("/_authenticated/admin/services")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => <SimpleCrudPage config={config} />,
});

const config: CrudConfig = {
  title: "Services",
  table: "services",
  titleKey: "title",
  hasStatus: true,
  hasFeatured: true,
  hasSortOrder: true,
  hasSlug: true,
  searchKeys: ["title", "short_description", "slug"],
  fields: [
    { key: "title", label: "Service Name", type: "text", required: true },
    { key: "icon", label: "Icon (lucide name)", type: "text" },
    { key: "image", label: "Image URL", type: "text" },
    { key: "short_description", label: "Short Description", type: "textarea" },
    { key: "description", label: "Full Description", type: "textarea" },
    { key: "features", label: "Features", type: "array", hint: "Comma or newline separated" },
    { key: "technologies", label: "Technologies", type: "array", hint: "Comma or newline separated" },
    { key: "cta_text", label: "CTA Text", type: "text" },
    { key: "cta_url", label: "CTA URL", type: "text" },
    { key: "seo_title", label: "SEO Title", type: "text" },
    { key: "seo_description", label: "SEO Description", type: "textarea" },
  ],
};

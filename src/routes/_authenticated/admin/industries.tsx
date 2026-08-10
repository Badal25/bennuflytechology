import { createFileRoute } from "@tanstack/react-router";
import { SimpleCrudPage, type CrudConfig } from "@/components/admin/simple-crud-page";

export const Route = createFileRoute("/_authenticated/admin/industries")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => <SimpleCrudPage config={config} />,
});

const config: CrudConfig = {
  title: "Industries",
  table: "industries",
  titleKey: "name",
  hasStatus: true,
  hasSortOrder: true,
  hasSlug: true,
  slugSource: "name",
  searchKeys: ["name", "description"],
  fields: [
    { key: "name", label: "Industry Name", type: "text", required: true },
    { key: "icon", label: "Icon", type: "text" },
    { key: "image", label: "Image URL", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
  ],
};

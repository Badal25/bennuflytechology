import { createFileRoute } from "@tanstack/react-router";
import { SimpleCrudPage, type CrudConfig } from "@/components/admin/simple-crud-page";

const CATEGORIES = ["Frontend", "Backend", "Database", "Mobile", "AI/ML", "Cloud", "DevOps", "Other"];

export const Route = createFileRoute("/_authenticated/admin/technologies")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => <SimpleCrudPage config={config} />,
});

const config: CrudConfig = {
  title: "Technologies",
  table: "technologies",
  titleKey: "name",
  hasStatus: true,
  hasSortOrder: true,
  searchKeys: ["name", "category", "description"],
  filterKey: "category",
  filterOptions: CATEGORIES,
  extraColumns: [{ key: "category", label: "Category" }],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "category", label: "Category", type: "select", options: CATEGORIES, required: true },
    { key: "icon", label: "Icon / Logo", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "website_url", label: "Website URL", type: "text" },
  ],
};

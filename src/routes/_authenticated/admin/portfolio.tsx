import { createFileRoute } from "@tanstack/react-router";
import { SimpleCrudPage, type CrudConfig } from "@/components/admin/simple-crud-page";

export const Route = createFileRoute("/_authenticated/admin/portfolio")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => <SimpleCrudPage config={config} />,
});

const config: CrudConfig = {
  title: "Portfolio",
  table: "portfolio_projects",
  titleKey: "title",
  hasStatus: true,
  hasFeatured: true,
  hasSortOrder: true,
  hasSlug: true,
  searchKeys: ["title", "short_description", "category", "client_name"],
  filterKey: "category",
  filterOptions: ["Web App", "Mobile App", "AI/ML", "Cloud", "Other"],
  extraColumns: [{ key: "category", label: "Category" }],
  fields: [
    { key: "title", label: "Project Name", type: "text", required: true },
    { key: "category", label: "Category", type: "select", options: ["Web App", "Mobile App", "AI/ML", "Cloud", "Other"] },
    { key: "short_description", label: "Short Description", type: "textarea" },
    { key: "description", label: "Full Description", type: "textarea" },
    { key: "technologies", label: "Technologies", type: "array" },
    { key: "cover_image", label: "Project Image URL", type: "text" },
    { key: "gallery", label: "Gallery Image URLs", type: "array" },
    { key: "live_url", label: "Live URL", type: "text" },
    { key: "github_url", label: "GitHub URL", type: "text" },
    { key: "project_status", label: "Project Status", type: "select", options: ["planning", "in_progress", "completed", "maintenance"] },
    { key: "client_name", label: "Client / Company", type: "text" },
    { key: "completion_date", label: "Completion Date", type: "date" },
    { key: "seo_title", label: "SEO Title", type: "text" },
    { key: "seo_description", label: "SEO Description", type: "textarea" },
  ],
};

import { createFileRoute } from "@tanstack/react-router";
import { SimpleCrudPage, type CrudConfig } from "@/components/admin/simple-crud-page";

export const Route = createFileRoute("/_authenticated/admin/blogs")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => <SimpleCrudPage config={config} />,
});

const config: CrudConfig = {
  title: "Blogs",
  table: "blogs",
  titleKey: "title",
  hasStatus: true,
  hasFeatured: true,
  hasSlug: true,
  searchKeys: ["title", "excerpt", "category", "author_name"],
  extraColumns: [{ key: "category", label: "Category" }],
  fields: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "category", label: "Category", type: "text" },
    { key: "author_name", label: "Author", type: "text" },
    { key: "thumbnail", label: "Thumbnail URL", type: "text" },
    { key: "published_at", label: "Published Date", type: "date" },
    { key: "tags", label: "Tags", type: "array" },
    { key: "excerpt", label: "Excerpt", type: "textarea" },
    { key: "content", label: "Content", type: "textarea" },
    { key: "seo_title", label: "SEO Title", type: "text" },
    { key: "og_image", label: "OG Image URL", type: "text" },
    { key: "seo_description", label: "SEO Description", type: "textarea" },
  ],
};

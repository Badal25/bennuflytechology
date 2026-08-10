import { createFileRoute } from "@tanstack/react-router";
import { SimpleCrudPage, type CrudConfig } from "@/components/admin/simple-crud-page";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => <SimpleCrudPage config={config} />,
});

const config: CrudConfig = {
  title: "Testimonials",
  table: "testimonials",
  titleKey: "client_name",
  hasStatus: true,
  hasSortOrder: true,
  searchKeys: ["client_name", "company", "message"],
  extraColumns: [{ key: "company", label: "Company" }],
  fields: [
    { key: "client_name", label: "Client Name", type: "text", required: true },
    { key: "company", label: "Company", type: "text" },
    { key: "designation", label: "Designation", type: "text" },
    { key: "image", label: "Profile Image URL", type: "text" },
    { key: "rating", label: "Rating (1-5)", type: "number" },
    { key: "message", label: "Testimonial", type: "textarea", required: true },
  ],
};

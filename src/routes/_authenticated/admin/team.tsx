import { createFileRoute } from "@tanstack/react-router";
import { SimpleCrudPage, type CrudConfig } from "@/components/admin/simple-crud-page";

export const Route = createFileRoute("/_authenticated/admin/team")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => <SimpleCrudPage config={config} />,
});

const config: CrudConfig = {
  title: "Team",
  table: "team_members",
  titleKey: "name",
  hasStatus: true,
  hasSortOrder: true,
  searchKeys: ["name", "designation", "email"],
  extraColumns: [{ key: "designation", label: "Designation" }],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "designation", label: "Designation", type: "text" },
    { key: "photo", label: "Photo URL", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "linkedin", label: "LinkedIn", type: "text" },
    { key: "github", label: "GitHub", type: "text" },
    { key: "instagram", label: "Instagram", type: "text" },
    { key: "bio", label: "Bio", type: "textarea" },
  ],
};

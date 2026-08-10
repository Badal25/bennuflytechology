import { createFileRoute } from "@tanstack/react-router";
import { SimpleCrudPage, type CrudConfig } from "@/components/admin/simple-crud-page";

export const Route = createFileRoute("/_authenticated/admin/faqs")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => <SimpleCrudPage config={config} />,
});

const config: CrudConfig = {
  title: "FAQs",
  table: "faqs",
  titleKey: "question",
  hasStatus: true,
  hasSortOrder: true,
  searchKeys: ["question", "answer", "category"],
  extraColumns: [{ key: "category", label: "Category" }],
  fields: [
    { key: "question", label: "Question", type: "text", required: true },
    { key: "category", label: "Category", type: "text" },
    { key: "answer", label: "Answer", type: "textarea", required: true },
  ],
};

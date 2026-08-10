import { createFileRoute } from "@tanstack/react-router";
import { SimpleCrudPage, type CrudConfig } from "@/components/admin/simple-crud-page";

export const Route = createFileRoute("/_authenticated/admin/jobs")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => <SimpleCrudPage config={config} />,
});

const config: CrudConfig = {
  title: "Jobs",
  table: "jobs",
  titleKey: "title",
  hasStatus: true,
  hasFeatured: true,
  hasSlug: true,
  searchKeys: ["title", "department", "location", "skills"],
  filterKey: "employment_type",
  filterOptions: ["Full Time", "Internship", "Freelance"],
  extraColumns: [
    { key: "department", label: "Department" },
    { key: "employment_type", label: "Type" },
    { key: "work_mode", label: "Mode" },
  ],
  fields: [
    { key: "title", label: "Job Title", type: "text", required: true },
    { key: "department", label: "Department", type: "text" },
    { key: "employment_type", label: "Employment Type", type: "select", options: ["Full Time", "Internship", "Freelance"], required: true },
    { key: "work_mode", label: "Work Mode", type: "select", options: ["Remote"], required: true },
    { key: "location", label: "Location", type: "text" },
    { key: "experience", label: "Experience", type: "text" },
    { key: "salary_range", label: "Salary Range", type: "text" },
    { key: "deadline", label: "Application Deadline", type: "date" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "responsibilities", label: "Responsibilities", type: "array" },
    { key: "requirements", label: "Requirements", type: "array" },
    { key: "skills", label: "Skills", type: "array" },
  ],
};

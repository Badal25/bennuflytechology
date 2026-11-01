import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "https://bennufly.wb-techofficial.workers.dev";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/services", changefreq: "weekly", priority: "0.9" },
  { path: "/technologies", changefreq: "monthly", priority: "0.7" },
  { path: "/portfolio", changefreq: "weekly", priority: "0.9" },
  { path: "/industries", changefreq: "monthly", priority: "0.7" },
  { path: "/process", changefreq: "monthly", priority: "0.6" },
  { path: "/careers", changefreq: "weekly", priority: "0.8" },
  { path: "/learning", changefreq: "monthly", priority: "0.6" },
  { path: "/ai-lab", changefreq: "monthly", priority: "0.7" },
  { path: "/architecture", changefreq: "monthly", priority: "0.7" },
  { path: "/verify", changefreq: "monthly", priority: "0.4" },
  { path: "/blog", changefreq: "daily", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/start-project", changefreq: "monthly", priority: "0.7" },
  { path: "/faq", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [...STATIC_ENTRIES];

        try {
          const supabase = createClient(
            process.env["VITE_SUPABASE_URL"]!,
            process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!,
            { auth: { persistSession: false } },
          );

          const [services, projects, blogs] = await Promise.all([
            supabase.from("services").select("slug").eq("status", "published"),
            supabase.from("portfolio_projects").select("slug").eq("status", "published"),
            supabase.from("blogs").select("slug").eq("status", "published"),
          ]);

          for (const row of services.data ?? [])
            entries.push({ path: `/services/${row.slug}`, changefreq: "monthly", priority: "0.7" });
          for (const row of projects.data ?? [])
            entries.push({ path: `/portfolio/${row.slug}`, changefreq: "monthly", priority: "0.7" });
          for (const row of blogs.data ?? [])
            entries.push({ path: `/blog/${row.slug}`, changefreq: "weekly", priority: "0.6" });
        } catch {
          // Fall back to static routes only.
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

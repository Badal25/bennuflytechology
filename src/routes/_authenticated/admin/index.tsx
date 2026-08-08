import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { Users, FileText, Briefcase, FolderKanban, Newspaper, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

const KPIS: { key: string; label: string; table: "leads" | "jobs" | "job_applications" | "blogs" | "portfolio_projects" | "newsletter_subscribers"; icon: typeof Users; filter?: (q: any) => any }[] = [
  { key: "leads", label: "Total Leads", table: "leads", icon: Users },
  { key: "new_leads", label: "New Leads", table: "leads", icon: Users, filter: (q) => q.eq("status", "New") },
  { key: "jobs", label: "Active Jobs", table: "jobs", icon: Briefcase, filter: (q) => q.eq("status", "published") },
  { key: "applications", label: "Applications", table: "job_applications", icon: FileText },
  { key: "blogs", label: "Published Blogs", table: "blogs", icon: Newspaper, filter: (q) => q.eq("status", "published") },
  { key: "portfolio", label: "Portfolio Projects", table: "portfolio_projects", icon: FolderKanban },
  { key: "newsletter", label: "Newsletter Subscribers", table: "newsletter_subscribers", icon: Mail },
];

function useKpis() {
  return useQuery({
    queryKey: ["admin-kpis"],
    queryFn: async () => {
      const results = await Promise.all(
        KPIS.map(async (k) => {
          let q = supabase.from(k.table).select("*", { count: "exact", head: true });
          if (k.filter) q = k.filter(q);
          const { count, error } = await q;
          if (error) throw new Error(error.message);
          return [k.key, count ?? 0] as const;
        }),
      );
      return Object.fromEntries(results) as Record<string, number>;
    },
  });
}

function useDailySeries(table: "leads" | "job_applications") {
  return useQuery({
    queryKey: ["admin-series", table],
    queryFn: async () => {
      const since = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase.from(table).select("created_at").gte("created_at", since);
      if (error) throw new Error(error.message);
      const buckets = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        buckets.set(format(startOfDay(subDays(new Date(), i)), "MMM d"), 0);
      }
      for (const row of data ?? []) {
        const key = format(startOfDay(new Date(row.created_at)), "MMM d");
        if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
      return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
    },
  });
}

function DashboardPage() {
  const { data: kpis, isLoading } = useKpis();
  const leadsSeries = useDailySeries("leads");
  const appsSeries = useDailySeries("job_applications");

  const hasLeadsData = (leadsSeries.data ?? []).some((d) => d.count > 0);
  const hasAppsData = (appsSeries.data ?? []).some((d) => d.count > 0);

  return (
    <AdminShell title="Dashboard" breadcrumb="Overview">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPIS.map((k) => {
            const Icon = k.icon;
            return (
              <Card key={k.key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{k.label}</CardTitle>
                  <Icon className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="text-2xl font-bold text-foreground">{kpis?.[k.key] ?? 0}</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Leads over time (30 days)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {leadsSeries.isLoading ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : !hasLeadsData ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={leadsSeries.data ?? []}>
                    <defs>
                      <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" fontSize={11} interval={5} />
                    <YAxis fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#leadsFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Applications over time (30 days)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {appsSeries.isLoading ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : !hasAppsData ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appsSeries.data ?? []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" fontSize={11} interval={5} />
                    <YAxis fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

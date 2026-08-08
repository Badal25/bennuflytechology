import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Cpu,
  Building2,
  UserSquare2,
  FileText,
  Newspaper,
  MessageSquareQuote,
  HelpCircle,
  Users2,
  Image,
  Mail,
  Search,
  ShieldCheck,
  Settings,
  Menu,
  LogOut,
  ShieldAlert,
  BarChart3,
} from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth, signOut } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: "all" | Array<"super_admin" | "hr" | "content_manager" | "sales" | "developer">;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: "all" },
  { to: "/admin/services", label: "Services", icon: Briefcase, roles: ["super_admin", "content_manager"] },
  { to: "/admin/portfolio", label: "Portfolio", icon: FolderKanban, roles: ["super_admin", "content_manager", "developer"] },
  { to: "/admin/technologies", label: "Technologies", icon: Cpu, roles: ["super_admin", "developer"] },
  { to: "/admin/industries", label: "Industries", icon: Building2, roles: ["super_admin", "content_manager"] },
  { to: "/admin/jobs", label: "Jobs", icon: UserSquare2, roles: ["super_admin", "hr"] },
  { to: "/admin/applications", label: "Applications", icon: FileText, roles: ["super_admin", "hr"] },
  { to: "/admin/leads", label: "Leads", icon: BarChart3, roles: ["super_admin", "sales"] },
  { to: "/admin/blogs", label: "Blogs", icon: Newspaper, roles: ["super_admin", "content_manager"] },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, roles: ["super_admin", "content_manager"] },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle, roles: ["super_admin", "content_manager"] },
  { to: "/admin/team", label: "Team", icon: Users2, roles: ["super_admin", "content_manager"] },
  { to: "/admin/media", label: "Media", icon: Image, roles: ["super_admin", "content_manager", "developer"] },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail, roles: ["super_admin", "sales"] },
  { to: "/admin/seo", label: "SEO", icon: Search, roles: ["super_admin", "content_manager"] },
  { to: "/admin/users", label: "Users", icon: ShieldCheck, roles: ["super_admin"] },
  { to: "/admin/settings", label: "Settings", icon: Settings, roles: ["super_admin"] },
];

function useAllowedNav() {
  const { isSuperAdmin, roles } = useAuth();
  return useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (item.roles === "all") return true;
        if (isSuperAdmin) return true;
        return item.roles.some((r) => roles.includes(r));
      }),
    [isSuperAdmin, roles],
  );
}

export function canAccessPath(path: string, isSuperAdmin: boolean, roles: string[]) {
  const item = NAV_ITEMS.find((i) => i.to === path);
  if (!item) return true;
  if (item.roles === "all") return true;
  if (isSuperAdmin) return true;
  return item.roles.some((r) => roles.includes(r));
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const items = useAllowedNav();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Wordmark to="/admin" />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3 text-[11px] text-muted-foreground">
        Bennufly Technology Pvt. Ltd.
      </div>
    </div>
  );
}

function initialsOf(name?: string | null, email?: string | null) {
  const src = name || email || "A";
  return src
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AdminShell({
  title,
  breadcrumb,
  children,
}: {
  title: string;
  breadcrumb?: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, roles, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const allowed = canAccessPath(pathname, isSuperAdmin, roles);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border lg:block">
        <div className="fixed h-screen w-64">
          <SidebarContent />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
            {breadcrumb && <p className="truncate text-xs text-muted-foreground">{breadcrumb}</p>}
          </div>

          <div className="relative hidden w-64 md:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Quick search..." className="pl-8" disabled />
          </div>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary/15 text-primary">
                    {initialsOf(user?.user_metadata?.["full_name"], user?.email)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="truncate text-sm font-medium">{user?.email}</p>
                <p className="truncate text-xs font-normal capitalize text-muted-foreground">
                  {roles.join(", ").replace(/_/g, " ") || "No role assigned"}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {allowed ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-24 text-center">
              <ShieldAlert className="size-8 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Access restricted</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Your role doesn't have permission to view this section. Contact a Super Admin if you believe this is
                a mistake.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

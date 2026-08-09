import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LogoLockup } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Bennufly Technology" },
      { name: "description", content: "Secure sign-in for authorized Bennufly Technology administrators." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

const emailSchema = z.string().trim().email("Enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

function AdminLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: "/admin" });
    }
  }, [authLoading, user, navigate]);

  function validate() {
    const next: Record<string, string> = {};
    const e = emailSchema.safeParse(email);
    if (!e.success) next["email"] = e.error.issues[0]?.message ?? "Invalid email";
    if (mode === "signin") {
      const p = passwordSchema.safeParse(password);
      if (!p.success) next["password"] = p.error.issues[0]?.message ?? "Invalid password";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("If that email belongs to an administrator, a reset link is on its way.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary/20 via-background to-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,theme(colors.primary/25%),transparent_60%)]" />
        <LogoLockup className="h-16" />
        <div className="space-y-4">
          <h1 className="text-4xl font-display font-bold leading-tight text-foreground">
            Building Ideas.
            <br />
            <span className="text-gradient">Engineering the Future.</span>
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            The Bennufly Technology admin workspace — manage content, people, leads and delivery from one place.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© Bennufly Technology Pvt. Ltd.</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex justify-center lg:hidden">
            <LogoLockup className="h-12" />
          </div>
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-semibold text-foreground">
              {mode === "signin" ? "Admin Sign In" : "Reset your password"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? "Access the Bennufly Technology admin dashboard."
                : "We'll email you a secure link to reset your password."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@bennufly.com"
                  className="pl-9"
                />
              </div>
              {errors["email"] && <p className="text-xs text-destructive">{errors["email"]}</p>}
            </div>

            {mode === "signin" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                  />
                </div>
                {errors["password"] && <p className="text-xs text-destructive">{errors["password"]}</p>}
              </div>
            )}

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "forgot" : "signin")}
              className="text-xs font-medium text-primary hover:underline"
            >
              {mode === "signin" ? "Forgot password?" : "Back to sign in"}
            </button>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "signin" ? "Sign In" : "Send reset link"}
            </Button>
          </form>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" />
            Authorized Bennufly administrators only.
          </div>
        </div>
      </div>
    </div>
  );
}

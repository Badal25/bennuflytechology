import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Enums } from "@/integrations/supabase/types";

export type AppRole = Enums<"app_role">;

export async function signOut() {
  await supabase.auth.signOut();
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    function loadRoles(userId: string) {
      setTimeout(async () => {
        const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
        if (!mounted) return;
        if (error) {
          setRoles([]);
        } else {
          setRoles((data ?? []).map((r) => r.role));
        }
        setLoading(false);
      }, 0);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setLoading(true);
        loadRoles(newSession.user.id);
      } else {
        setRoles([]);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadRoles(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  function has(role: AppRole) {
    return roles.includes(role);
  }

  const isSuperAdmin = has("super_admin");
  const isStaff = roles.length > 0;

  return {
    user,
    session,
    roles,
    loading,
    isStaff,
    has,
    canContent: isSuperAdmin || has("content_manager"),
    canTech: isSuperAdmin || has("developer"),
    canHR: isSuperAdmin || has("hr"),
    canSales: isSuperAdmin || has("sales"),
    isSuperAdmin,
  };
}

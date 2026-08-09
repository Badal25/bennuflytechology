import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const roleSchema = z.enum(["super_admin", "hr", "content_manager", "sales", "developer"]);

async function assertSuperAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "super_admin",
  });
  if (error || !data) throw new Error("Forbidden: Super Admin access required");
}

export type AdminUserRow = {
  userId: string;
  email: string;
  fullName: string | null;
  roles: string[];
  disabled: boolean;
  lastSignInAt: string | null;
  createdAt: string;
};

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (authError) throw new Error(authError.message);

    const { data: roleRows } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const { data: profileRows } = await supabaseAdmin.from("profiles").select("user_id, full_name");

    const rolesByUser = new Map<string, string[]>();
    for (const r of roleRows ?? []) {
      rolesByUser.set(r.user_id, [...(rolesByUser.get(r.user_id) ?? []), r.role as string]);
    }
    const nameByUser = new Map((profileRows ?? []).map((p) => [p.user_id, p.full_name]));

    return authUsers.users.map((u) => ({
      userId: u.id,
      email: u.email ?? "",
      fullName: nameByUser.get(u.id) ?? null,
      roles: rolesByUser.get(u.id) ?? [],
      disabled: Boolean((u as { banned_until?: string | null }).banned_until),
      lastSignInAt: u.last_sign_in_at ?? null,
      createdAt: u.created_at,
    }));
  });

export const inviteAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().trim().email(),
        role: roleSchema,
        fullName: z.string().trim().max(120).optional(),
        redirectTo: z.string().url(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      redirectTo: data.redirectTo,
      ...(data.fullName ? { data: { full_name: data.fullName } } : {}),
    });
    if (error) throw new Error(error.message);

    const userId = invited.user?.id;
    if (!userId) throw new Error("Invite failed");

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: data.role }, { onConflict: "user_id,role" });
    if (roleError) throw new Error(roleError.message);

    return { ok: true, userId };
  });

export const setAdminUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid(), role: roleSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const revokeAdminAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    if (data.userId === context.userId) throw new Error("You cannot revoke your own admin access");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setAdminUserDisabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid(), disabled: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    if (data.userId === context.userId) throw new Error("You cannot disable your own account");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.disabled ? "876000h" : "none",
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("profiles")
      .update({ status: data.disabled ? "disabled" : "active" })
      .eq("user_id", data.userId);
    return { ok: true };
  });

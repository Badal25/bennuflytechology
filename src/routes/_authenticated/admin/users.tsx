import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, UserPlus, ShieldOff, Ban, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  listAdminUsers,
  inviteAdminUser,
  setAdminUserRole,
  revokeAdminAccess,
  setAdminUserDisabled,
} from "@/lib/admin-users.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AdminUsersPage,
});

const ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "hr", label: "HR" },
  { value: "content_manager", label: "Content Manager" },
  { value: "sales", label: "Sales" },
  { value: "developer", label: "Developer" },
];

function AdminUsersPage() {
  const { isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const fetchUsers = useServerFn(listAdminUsers);
  const invite = useServerFn(inviteAdminUser);
  const changeRole = useServerFn(setAdminUserRole);
  const revoke = useServerFn(revokeAdminAccess);
  const setDisabled = useServerFn(setAdminUserDisabled);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("hr");

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers({}),
    enabled: isSuperAdmin,
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  }

  const inviteMutation = useMutation({
    mutationFn: () =>
      invite({
        data: {
          email,
          role: role as "hr",
          ...(fullName.trim() ? { fullName: fullName.trim() } : {}),
          redirectTo: `${window.location.origin}/reset-password`,
        },
      }),
    onSuccess: () => {
      toast.success("Invitation sent");
      setEmail("");
      setFullName("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const roleMutation = useMutation({
    mutationFn: (vars: { userId: string; role: string }) =>
      changeRole({ data: { userId: vars.userId, role: vars.role as "hr" } }),
    onSuccess: () => {
      toast.success("Role updated");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (userId: string) => revoke({ data: { userId } }),
    onSuccess: () => {
      toast.success("Admin access removed");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const disableMutation = useMutation({
    mutationFn: (vars: { userId: string; disabled: boolean }) => setDisabled({ data: vars }),
    onSuccess: () => {
      toast.success("User status updated");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell title="Admin Users" breadcrumb="Manage administrator accounts and roles">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="size-4" /> Invite an administrator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-[1fr_1fr_200px_auto]"
              onSubmit={(e) => {
                e.preventDefault();
                inviteMutation.mutate();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hr@bennufly.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-name">Full name (optional)</Label>
                <Input id="invite-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Invite
                </Button>
              </div>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">
              The invited user receives a secure email link to set their own password. Roles are assigned here —
              never automatically.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : usersQuery.error ? (
              <p className="py-6 text-sm text-destructive">{(usersQuery.error as Error).message}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(usersQuery.data ?? []).map((u) => (
                      <TableRow key={u.userId}>
                        <TableCell>
                          <p className="font-medium text-foreground">{u.fullName || "—"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={u.roles[0] ?? ""}
                            onValueChange={(value) => roleMutation.mutate({ userId: u.userId, role: value })}
                          >
                            <SelectTrigger className="w-[170px]">
                              <SelectValue placeholder="No admin role" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((r) => (
                                <SelectItem key={r.value} value={r.value}>
                                  {r.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {u.disabled ? (
                            <Badge variant="destructive">Disabled</Badge>
                          ) : u.roles.length ? (
                            <Badge variant="secondary">Active</Badge>
                          ) : (
                            <Badge variant="outline">No access</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {u.lastSignInAt ? format(new Date(u.lastSignInAt), "d MMM yyyy, HH:mm") : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                disableMutation.mutate({ userId: u.userId, disabled: !u.disabled })
                              }
                            >
                              {u.disabled ? (
                                <>
                                  <CheckCircle2 className="mr-1 size-3.5" /> Enable
                                </>
                              ) : (
                                <>
                                  <Ban className="mr-1 size-3.5" /> Disable
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              disabled={!u.roles.length}
                              onClick={() => revokeMutation.mutate(u.userId)}
                            >
                              <ShieldOff className="mr-1 size-3.5" /> Revoke
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Download, Trash2, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, Mail, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminToolbar, AdminListState } from "@/components/admin/admin-list";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useResource } from "@/lib/admin";
import { supabase } from "@/integrations/supabase/client";
import { sendCustomEmailFn, ALLOWED_SENDERS } from "@/lib/custom-email.functions";

export const Route = createFileRoute("/_authenticated/admin/newsletter")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: NewsletterAndEmailPage,
});

const QUICK_TEMPLATES = [
  {
    name: "General Follow-up",
    sender: "info@bennufly.in",
    subject: "Follow-up regarding your inquiry with Bennufly Technology",
    message: "Dear Client,\n\nThank you for reaching out to Bennufly Technology.\n\nWe would like to follow up on your recent inquiry and understand how we can best assist your business goals.\n\nPlease let us know your convenient time for a quick discussion.\n\nBest regards,\nBennufly Team",
  },
  {
    name: "Interview Call",
    sender: "careers@bennufly.in",
    subject: "Interview Invitation - Bennufly Technology",
    message: "Dear Candidate,\n\nCongratulations! We reviewed your profile and would love to invite you for an interview session.\n\nPlease reply with your availability over the next two days.\n\nBest regards,\nHR Team - Bennufly Technology",
  },
  {
    name: "Support Reply",
    sender: "support@bennufly.in",
    subject: "Update on your Bennufly Support Request",
    message: "Hello,\n\nOur technical support team has reviewed your request.\n\nWe are actively working on it and will keep you updated once resolved.\n\nBest regards,\nBennufly Support Desk",
  },
];

function NewsletterAndEmailPage() {
  return (
    <AdminShell
      title="Email & Newsletter Center"
      description="Send direct emails via Brevo or manage newsletter subscribers."
    >
      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="compose" className="gap-2">
            <Mail className="w-4 h-4" /> Direct Mail Sender
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="gap-2">
            <Users className="w-4 h-4" /> Subscribers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <DirectEmailComposer />
        </TabsContent>

        <TabsContent value="subscribers">
          <SubscribersList />
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}

function DirectEmailComposer() {
  const [senderEmail, setSenderEmail] = useState<(typeof ALLOWED_SENDERS)[number]["email"]>("careers@bennufly.in");
  const [toEmail, setToEmail] = useState("");
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [applyBranding, setApplyBranding] = useState(true);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApplyTemplate = (tmpl: (typeof QUICK_TEMPLATES)[number]) => {
    setSenderEmail(tmpl.sender as any);
    setSubject(tmpl.subject);
    setMessage(tmpl.message);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!toEmail || !subject || !message) {
      setStatus({ type: "error", text: "Please fill all required fields." });
      return;
    }

    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setStatus({ type: "error", text: "Session expired. Please re-login to admin." });
        return;
      }

      const res = await sendCustomEmailFn({
        data: {
          accessToken: token,
          senderEmail,
          toEmail,
          toName: toName.trim() || undefined,
          subject,
          messageHtml: message,
          applyBranding,
        },
      });

      if (res.sent) {
        setStatus({ type: "success", text: `Email successfully sent from ${senderEmail} to ${toEmail}!` });
        setSubject("");
        setMessage("");
        setToEmail("");
        setToName("");
      } else {
        setStatus({ type: "error", text: res.reason || "Failed to send email." });
      }
    } catch (err: any) {
      setStatus({ type: "error", text: err?.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Quick Templates:
        </span>
        {QUICK_TEMPLATES.map((tmpl) => (
          <Button
            key={tmpl.name}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleApplyTemplate(tmpl)}
            className="text-xs h-7"
          >
            {tmpl.name}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compose Direct Email</CardTitle>
          <CardDescription>
            Send official emails using verified Bennufly sender addresses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <Label>From (Sender Address)</Label>
              <Select value={senderEmail} onValueChange={(val: any) => setSenderEmail(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Sender" />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_SENDERS.map((s) => (
                    <SelectItem key={s.email} value={s.email}>
                      <span className="font-medium">{s.name}</span> &lt;{s.email}&gt;
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>To (Recipient Email) *</Label>
                <Input
                  type="email"
                  placeholder="recipient@example.com"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Recipient Name (Optional)</Label>
                <Input
                  type="text"
                  placeholder="Recipient Name"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Subject Line *</Label>
              <Input
                type="text"
                placeholder="Important update from Bennufly Technology"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Message Content *</Label>
              <Textarea
                rows={8}
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between border rounded-lg p-3 bg-muted/30">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Bennufly Branded Template</Label>
                <p className="text-xs text-muted-foreground">
                  Wrap this message in official Bennufly header and footer design.
                </p>
              </div>
              <Switch checked={applyBranding} onCheckedChange={setApplyBranding} />
            </div>

            {status && (
              <div
                className={`p-3 rounded-md flex items-center gap-2 text-sm ${
                  status.type === "success"
                    ? "bg-green-500/10 text-green-600 border border-green-500/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{status.text}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Email
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SubscribersList() {
  const { items, isLoading, error, remove } = useResource("newsletter_subscribers", {
    orderBy: "subscribed_at",
    ascending: false,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const filtered = useMemo(
    () =>
      items.filter(
        (r) =>
          (!search ||
            [r.email, r.name].some((v) => String(v ?? "").toLowerCase().includes(search.toLowerCase()))) &&
          (status === "all" || r.status === status),
      ),
    [items, search, status],
  );

  function exportCsv() {
    const rows = [
      ["Email", "Name", "Status", "Subscribed At"],
      ...filtered.map((s) => [s.email, s.name || "", s.status, s.subscribed_at ? format(new Date(s.subscribed_at), "yyyy-MM-dd HH:mm") : ""]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search email or name..."
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        }
      >
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
      </AdminToolbar>

      <AdminListState isLoading={isLoading} error={error} isEmpty={filtered.length === 0} emptyMessage="No subscribers found">
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.email}</TableCell>
                  <TableCell>{row.name || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "active" ? "default" : "secondary"}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.subscribed_at ? format(new Date(row.subscribed_at), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(row)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AdminListState>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete subscriber?"
        description={`Remove ${deleteTarget?.email} from newsletter list?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (deleteTarget) {
            await remove(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}

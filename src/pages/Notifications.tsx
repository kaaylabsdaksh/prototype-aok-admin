import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { notifications as seed, NotificationItem, NotificationKind } from "@/data/portfolio";
import { CheckCheck, Search, Bell, Boxes, Inbox, Activity, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  enquiry: Inbox, inventory: Boxes, booking: Activity, system: Bell, audit: ShieldAlert,
};

export default function Notifications() {
  const [items, setItems] = useState(seed);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const noop = (_n: NotificationItem) => {};

  const filtered = items.filter((n) => {
    if (search && !`${n.title} ${n.body}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (kind !== "all" && n.type !== kind) return false;
    if (unreadOnly && !n.unread) return false;
    return true;
  });

  const markAll = () => setItems((ns) => ns.map((n) => ({ ...n, unread: false })));
  const toggle = (id: string) => setItems((ns) => ns.map((n) => n.id === id ? { ...n, unread: !n.unread } : n));

  return (
    <AppShell onOpenNotification={noop}>
      <PageHeader
        title="Notifications"
        subtitle="System events and operational alerts across all tenants."
        actions={<Button variant="outline" size="sm" onClick={markAll} className="gap-1.5"><CheckCheck className="h-4 w-4" /> Mark all read</Button>}
      />

      <div className="rounded-2xl border border-border/60 bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger className="h-9 w-44 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="enquiry">Enquiry</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="booking">Booking</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="audit">Audit</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={unreadOnly ? "default" : "outline"} size="sm" onClick={() => setUnreadOnly((v) => !v)}>Unread only</Button>
        </div>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-border/60 bg-card divide-y divide-border/60">
        {filtered.map((n) => {
          const Icon = KIND_ICON[n.type];
          return (
            <li
              key={n.id}
              onClick={() => toggle(n.id)}
              className={cn("flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/40", n.unread && "bg-accent/30")}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground/70">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                {n.refId && <p className="mt-1 font-mono text-[10px] text-muted-foreground">{n.refId}</p>}
              </div>
              {n.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </li>
          );
        })}
        {filtered.length === 0 && <li className="py-12 text-center text-sm text-muted-foreground">No notifications.</li>}
      </ul>
    </AppShell>
  );
}

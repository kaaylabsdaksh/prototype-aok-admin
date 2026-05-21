import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/admin/PageHeader";
import { KpiStrip } from "@/components/admin/KpiStrip";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { adminEvents, utilisation, bookingState } from "@/data/admin-inventory";
import { adminEnquiries, ENQUIRY_STATUS_LABEL } from "@/data/admin-enquiries";
import { notifications, NotificationItem } from "@/data/portfolio";
import { Boxes, Inbox, Clock, CheckCircle2, AlertTriangle, Users, ArrowUpRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [notif, setNotif] = useState<NotificationItem | null>(null);
  void notif;

  const today = new Date();
  const upcoming = adminEvents
    .filter((e) => new Date(e.date) >= today && e.publish === "published")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const queue = adminEnquiries
    .filter((e) => e.status === "received" || e.status === "in_progress")
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  const totalCap = adminEvents.reduce((s, e) => s + e.capacity, 0);
  const totalBooked = adminEvents.reduce((s, e) => s + e.booked, 0);
  const utilOverall = totalCap ? Math.round((totalBooked / totalCap) * 100) : 0;

  const kpis = [
    { icon: Boxes, label: "Active events", value: adminEvents.filter((e) => e.publish === "published").length },
    { icon: Inbox, label: "Open enquiries", value: adminEnquiries.filter((e) => e.status !== "confirmed" && e.status !== "declined").length, tone: "info" as const },
    { icon: Clock, label: "Awaiting review", value: adminEnquiries.filter((e) => e.status === "received").length, tone: "warning" as const },
    { icon: CheckCircle2, label: "Confirmed (30d)", value: adminEnquiries.filter((e) => e.status === "confirmed").length, tone: "success" as const },
    { icon: Users, label: "Utilisation", value: `${utilOverall}%`, tone: (utilOverall >= 70 ? "success" : "warning") as "success" | "warning" },
    { icon: AlertTriangle, label: "Alerts", value: notifications.filter((n) => n.unread).length, tone: "destructive" as const },
  ];

  return (
    <AppShell onOpenNotification={setNotif}>
      <PageHeader
        title="Operations dashboard"
        subtitle="Live view of inventory, enquiries and system activity."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/inventory">Inventory</Link></Button>
            <Button asChild size="sm"><Link to="/enquiries">Enquiry queue</Link></Button>
          </div>
        }
      />

      <KpiStrip items={kpis} />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming events */}
        <section className="rounded-2xl border border-border/60 bg-card">
          <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Today & upcoming</h2>
              <p className="text-xs text-muted-foreground">Next 5 published events</p>
            </div>
            <Link to="/inventory" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">View all <ArrowUpRight className="h-3 w-3" /></Link>
          </header>
          <ul className="divide-y divide-border/60">
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    <Calendar className="mr-1 inline h-3 w-3" />{new Date(e.date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {e.venue}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right text-[11px]">
                    <div className="font-mono tabular-nums">{e.booked}/{e.capacity}</div>
                    <div className="text-muted-foreground">{utilisation(e)}%</div>
                  </div>
                  <StatusBadge kind="booking" value={bookingState(e)} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Enquiry queue */}
        <section className="rounded-2xl border border-border/60 bg-card">
          <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Enquiry queue</h2>
              <p className="text-xs text-muted-foreground">Pending review and in-progress</p>
            </div>
            <Link to="/enquiries" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">View all <ArrowUpRight className="h-3 w-3" /></Link>
          </header>
          <ul className="divide-y divide-border/60">
            {queue.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.ref} · {e.tenantName}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{e.eventType} · {e.guests} guests · ${e.budget.toLocaleString()}</p>
                </div>
                <StatusBadge kind="enquiry" value={e.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recent activity */}
      <section className="rounded-2xl border border-border/60 bg-card">
        <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <p className="text-xs text-muted-foreground">System events and operational alerts</p>
          </div>
          <Link to="/notifications" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">View all <ArrowUpRight className="h-3 w-3" /></Link>
        </header>
        <ul className="divide-y divide-border/60">
          {notifications.map((n) => (
            <li key={n.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-primary" : "bg-border"}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{n.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">{n.body}</p>
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Status legend */}
      <section className="grid gap-3 rounded-2xl border border-border/60 bg-card p-4 text-xs text-muted-foreground md:grid-cols-2">
        <div>
          <p className="mb-2 font-semibold text-foreground">Enquiry pipeline</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ENQUIRY_STATUS_LABEL) as Array<keyof typeof ENQUIRY_STATUS_LABEL>).map((s) => (
              <StatusBadge key={s} kind="enquiry" value={s} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-semibold text-foreground">Publish status</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge kind="publish" value="draft" />
            <StatusBadge kind="publish" value="published" />
            <StatusBadge kind="publish" value="cancelled" />
          </div>
        </div>
      </section>
    </AppShell>
  );
}

import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/admin/PageHeader";
import { KpiStrip } from "@/components/admin/KpiStrip";
import { Button } from "@/components/ui/button";
import { adminEvents, utilisation, bookingState } from "@/data/admin-inventory";
import { adminEnquiries, ENQUIRY_PIPELINE, ENQUIRY_STATUS_LABEL } from "@/data/admin-enquiries";
import { tenants } from "@/data/admin-tenants";
import { Download, BarChart3, Gauge, Timer, Building2 } from "lucide-react";
import type { NotificationItem } from "@/data/portfolio";

export default function Reports() {
  const noop = (_n: NotificationItem) => {};

  const totalCap = adminEvents.reduce((s, e) => s + e.capacity, 0);
  const totalBooked = adminEvents.reduce((s, e) => s + e.booked, 0);
  const utilOverall = totalCap ? Math.round((totalBooked / totalCap) * 100) : 0;

  const conversion = adminEnquiries.length
    ? Math.round((adminEnquiries.filter((e) => e.status === "confirmed").length / adminEnquiries.length) * 100)
    : 0;

  // Funnel counts: each stage counts enquiries that REACHED that status (or further)
  const funnel = useMemo(() => {
    return ENQUIRY_PIPELINE.map((stage, i) => {
      const count = adminEnquiries.filter((e) => {
        const reached = e.timeline.some((t) => t.status === stage);
        return reached;
      }).length;
      return { stage, label: ENQUIRY_STATUS_LABEL[stage], count, idx: i };
    });
  }, []);
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.count));

  const tenantBreakdown = useMemo(() => {
    return tenants.map((t) => {
      const eqs = adminEnquiries.filter((e) => e.tenantId === t.id);
      const confirmed = eqs.filter((e) => e.status === "confirmed").length;
      return { tenant: t.name, total: eqs.length, confirmed };
    });
  }, []);
  const maxTenant = Math.max(1, ...tenantBreakdown.map((t) => t.total));

  const kpis = [
    { icon: Gauge, label: "Utilisation", value: `${utilOverall}%`, tone: "success" as const },
    { icon: BarChart3, label: "Enquiries (all)", value: adminEnquiries.length },
    { icon: Timer, label: "Avg response", value: "1.8d", tone: "info" as const },
    { icon: Building2, label: "Active tenants", value: tenants.filter((t) => t.status === "active").length },
    { icon: BarChart3, label: "Conversion", value: `${conversion}%`, tone: "success" as const },
    { icon: Gauge, label: "Capacity sold", value: `${totalBooked.toLocaleString()}` },
  ];

  return (
    <AppShell onOpenNotification={noop}>
      <PageHeader
        title="Reports"
        subtitle="Operational performance across inventory, enquiries and tenants."
        actions={<Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Export CSV</Button>}
      />
      <KpiStrip items={kpis} />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Funnel */}
        <section className="rounded-2xl border border-border/60 bg-card p-4">
          <h2 className="text-sm font-semibold">Enquiry funnel</h2>
          <p className="text-xs text-muted-foreground">Volume reaching each pipeline stage</p>
          <ul className="mt-4 space-y-2">
            {funnel.map((f) => (
              <li key={f.stage}>
                <div className="flex items-center justify-between text-xs">
                  <span>{f.label}</span>
                  <span className="tabular-nums text-muted-foreground">{f.count}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${(f.count / maxFunnel) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Utilisation */}
        <section className="rounded-2xl border border-border/60 bg-card p-4">
          <h2 className="text-sm font-semibold">Top events by utilisation</h2>
          <p className="text-xs text-muted-foreground">Published events only</p>
          <ul className="mt-4 space-y-2">
            {[...adminEvents].filter((e) => e.publish === "published").sort((a, b) => utilisation(b) - utilisation(a)).slice(0, 6).map((e) => (
              <li key={e.id}>
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate">{e.name}</span>
                  <span className="tabular-nums text-muted-foreground">{utilisation(e)}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-success" style={{ width: `${utilisation(e)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Tenants */}
        <section className="rounded-2xl border border-border/60 bg-card p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Enquiries by tenant</h2>
          <p className="text-xs text-muted-foreground">Total vs confirmed</p>
          <ul className="mt-4 space-y-2">
            {tenantBreakdown.map((t) => (
              <li key={t.tenant}>
                <div className="flex items-center justify-between text-xs">
                  <span>{t.tenant}</span>
                  <span className="tabular-nums text-muted-foreground">{t.confirmed}/{t.total} confirmed</span>
                </div>
                <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-success" style={{ width: `${(t.confirmed / maxTenant) * 100}%` }} />
                  <div className="h-full bg-primary/60" style={{ width: `${((t.total - t.confirmed) / maxTenant) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Booking state mix */}
        <section className="rounded-2xl border border-border/60 bg-card p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Inventory snapshot</h2>
          <p className="text-xs text-muted-foreground">By booking state</p>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
            {["available", "filling", "almost_full", "full", "waitlist"].map((s) => {
              const n = adminEvents.filter((e) => bookingState(e) === s).length;
              return (
                <div key={s} className="rounded-xl border border-border bg-secondary/40 p-3 text-center">
                  <p className="text-2xl font-semibold tabular-nums">{n}</p>
                  <p className="mt-1 text-[11px] capitalize text-muted-foreground">{s.replace("_", " ")}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

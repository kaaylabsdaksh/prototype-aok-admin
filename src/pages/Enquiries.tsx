import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/admin/PageHeader";
import { KpiStrip } from "@/components/admin/KpiStrip";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EnquiryDetailDrawer } from "@/components/admin/EnquiryDetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { adminEnquiries, AdminEnquiry, EnquiryStatus, ENQUIRY_STATUS_LABEL } from "@/data/admin-enquiries";
import { tenants, team } from "@/data/admin-tenants";
import { Inbox, Loader2, FileText, CheckCircle2, XCircle, Clock, Search, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { NotificationItem } from "@/data/portfolio";

export default function Enquiries() {
  const [data, setData] = useState<AdminEnquiry[]>(adminEnquiries);
  const [search, setSearch] = useState("");
  const [fTenant, setFTenant] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fType, setFType] = useState("all");
  const [fAssignee, setFAssignee] = useState("all");
  const [fFrom, setFFrom] = useState<Date | undefined>(undefined);
  const [fTo, setFTo] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState<AdminEnquiry | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => data.filter((e) => {
    if (search && !`${e.ref} ${e.tenantName} ${e.contactName} ${e.brief}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (fTenant !== "all" && e.tenantId !== fTenant) return false;
    if (fStatus !== "all" && e.status !== fStatus) return false;
    if (fType !== "all" && e.eventType !== fType) return false;
    if (fAssignee !== "all" && e.assignedTo !== fAssignee) return false;
    const t = new Date(e.submittedAt).getTime();
    if (fFrom && t < new Date(fFrom.getFullYear(), fFrom.getMonth(), fFrom.getDate()).getTime()) return false;
    if (fTo && t > new Date(fTo.getFullYear(), fTo.getMonth(), fTo.getDate(), 23, 59, 59, 999).getTime()) return false;
    return true;
  }), [data, search, fTenant, fStatus, fType, fAssignee, fFrom, fTo]);

  const activeFilterCount = [fTenant !== "all", fStatus !== "all", fType !== "all", fAssignee !== "all", !!fFrom, !!fTo].filter(Boolean).length;
  const clearFilters = () => { setFTenant("all"); setFStatus("all"); setFType("all"); setFAssignee("all"); setFFrom(undefined); setFTo(undefined); };

  const kpis = useMemo(() => ([
    { icon: Inbox, label: "Total", value: data.length },
    { icon: Clock, label: "Pending review", value: data.filter((e) => e.status === "received").length, tone: "warning" as const },
    { icon: Loader2, label: "In progress", value: data.filter((e) => e.status === "in_progress").length, tone: "info" as const },
    { icon: FileText, label: "Proposal sent", value: data.filter((e) => e.status === "proposal_sent").length, tone: "info" as const },
    { icon: CheckCircle2, label: "Confirmed", value: data.filter((e) => e.status === "confirmed").length, tone: "success" as const },
    { icon: XCircle, label: "Declined", value: data.filter((e) => e.status === "declined").length, tone: "destructive" as const },
  ]), [data]);

  const eventTypes = Array.from(new Set(data.map((e) => e.eventType)));

  const allChecked = filtered.length > 0 && filtered.every((e) => selected.includes(e.id));
  const toggleAll = () => setSelected(allChecked ? selected.filter((id) => !filtered.find((e) => e.id === id)) : [...new Set([...selected, ...filtered.map((e) => e.id)])]);

  const bulkStatus = (status: EnquiryStatus) => {
    setData((d) => d.map((e) => selected.includes(e.id) ? { ...e, status, timeline: [{ at: new Date().toISOString(), status, by: "Sofia Patel" }, ...e.timeline] } : e));
    toast.success(`${selected.length} enquiries set to ${ENQUIRY_STATUS_LABEL[status]}`);
    setSelected([]);
  };

  const noop = (_n: NotificationItem) => {};

  return (
    <AppShell onOpenNotification={noop}>
      <PageHeader title="Enquiries" subtitle="Route, assign and progress enquiries across all tenants." />
      <KpiStrip items={kpis} />

      <div className="rounded-2xl border border-border/60 bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by ref, tenant, brief…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Filter label="Tenant" value={fTenant} onChange={setFTenant} options={[{ v: "all", l: "All tenants" }, ...tenants.map((t) => ({ v: t.id, l: t.name }))]} />
          <Filter label="Status" value={fStatus} onChange={setFStatus} options={[
            { v: "all", l: "Any status" }, { v: "received", l: "Received" }, { v: "in_progress", l: "In Progress" },
            { v: "proposal_sent", l: "Proposal Sent" }, { v: "confirmed", l: "Confirmed" }, { v: "declined", l: "Declined" },
          ]} />
          <Filter label="Type" value={fType} onChange={setFType} options={[{ v: "all", l: "Any type" }, ...eventTypes.map((t) => ({ v: t, l: t }))]} />
          <Filter label="Assignee" value={fAssignee} onChange={setFAssignee} options={[{ v: "all", l: "Any assignee" }, ...team.map((t) => ({ v: t.id, l: t.name }))]} />
          <Filter label="Submitted" value={fSubmitted} onChange={setFSubmitted} options={[
            { v: "all", l: "Any time" }, { v: "today", l: "Last 24 hours" }, { v: "7d", l: "Last 7 days" },
            { v: "30d", l: "Last 30 days" }, { v: "90d", l: "Last 90 days" }, { v: "custom", l: "Custom range" },
          ]} />
          {fSubmitted === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 text-xs font-normal", !fSubmittedRange?.from && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {fSubmittedRange?.from ? (
                    fSubmittedRange.to ? `${format(fSubmittedRange.from, "LLL d")} – ${format(fSubmittedRange.to, "LLL d, y")}` : format(fSubmittedRange.from, "LLL d, y")
                  ) : "Pick a range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={fSubmittedRange} onSelect={setFSubmittedRange} numberOfMonths={2} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-primary/40 bg-primary/5 px-4 py-2 text-sm">
          <span>{selected.length} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => bulkStatus("in_progress")}>Mark in progress</Button>
            <Button size="sm" variant="outline" onClick={() => bulkStatus("proposal_sent")}>Proposal sent</Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => bulkStatus("declined")}>Decline</Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-secondary/60 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-8 px-3 py-2"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></th>
                <th className="px-3 py-2 text-left font-medium">Reference</th>
                <th className="px-3 py-2 text-left font-medium">Tenant</th>
                <th className="px-3 py-2 text-left font-medium">Event type</th>
                <th className="px-3 py-2 text-left font-medium">Preferred date</th>
                <th className="px-3 py-2 text-right font-medium">Budget</th>
                <th className="px-3 py-2 text-left font-medium">Assigned</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const checked = selected.includes(e.id);
                const assignee = team.find((t) => t.id === e.assignedTo);
                return (
                  <tr key={e.id} onClick={() => setOpen(e)} className="cursor-pointer border-t border-border/60 transition-colors hover:bg-secondary/40">
                    <td className="px-3 py-2" onClick={(ev) => ev.stopPropagation()}>
                      <Checkbox checked={checked} onCheckedChange={() => setSelected(checked ? selected.filter((id) => id !== e.id) : [...selected, e.id])} />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{e.ref}</td>
                    <td className="px-3 py-2">{e.tenantName}<div className="text-[10px] text-muted-foreground">{e.contactName}</div></td>
                    <td className="px-3 py-2 text-muted-foreground">{e.eventType}</td>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(e.preferredDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="px-3 py-2 text-right tabular-nums">${e.budget.toLocaleString()}</td>
                    <td className="px-3 py-2">{assignee ? assignee.name : <span className="text-muted-foreground">Unassigned</span>}</td>
                    <td className="px-3 py-2"><StatusBadge kind="enquiry" value={e.status} /></td>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(e.submittedAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-3 py-12 text-center text-sm text-muted-foreground">No enquiries match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EnquiryDetailDrawer
        enquiry={open}
        onOpenChange={(o) => !o && setOpen(null)}
        onMutate={(updater) => {
          if (!open) return;
          setData((d) => d.map((e) => (e.id === open.id ? updater(e) : e)));
          setOpen((curr) => (curr ? updater(curr) : curr));
        }}
      />
    </AppShell>
  );
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-auto min-w-[140px] text-xs">
        <span className="mr-1 text-muted-foreground">{label}:</span><SelectValue />
      </SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
    </Select>
  );
}

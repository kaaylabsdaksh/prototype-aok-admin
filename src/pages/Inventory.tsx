import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/admin/PageHeader";
import { KpiStrip } from "@/components/admin/KpiStrip";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EventDetailDrawer } from "@/components/admin/EventDetailDrawer";
import { CreateEventDrawer } from "@/components/admin/CreateEventDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { adminEvents, AdminEvent, utilisation, availableSeats, bookingState, eventTypes, venues } from "@/data/admin-inventory";
import { tenants } from "@/data/admin-tenants";
import { Calendar, CheckCircle2, FileEdit, XCircle, Users, Boxes, Plus, Search, ChevronUp, ChevronDown, Clock, Filter as FilterIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";
import type { NotificationItem } from "@/data/portfolio";

type SortKey = "name" | "date" | "booked" | "capacity";

export default function Inventory() {
  const [data, setData] = useState<AdminEvent[]>(adminEvents);
  const [search, setSearch] = useState("");
  const [fType, setFType] = useState("all");
  const [fVenue, setFVenue] = useState("all");
  const [fPublish, setFPublish] = useState("all");
  const [fVisibility, setFVisibility] = useState("any");
  const [fBooking, setFBooking] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "date", dir: "asc" });
  const [selected, setSelected] = useState<string[]>([]);
  const [openEvent, setOpenEvent] = useState<AdminEvent | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (searchOpen) searchInputRef.current?.focus(); }, [searchOpen]);

  const filtered = useMemo(() => {
    return data.filter((e) => {
      if (search && !`${e.name} ${e.ref} ${e.venue}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (fType !== "all" && e.type !== fType) return false;
      if (fVenue !== "all" && e.venue !== fVenue) return false;
      if (fPublish !== "all" && e.publish !== fPublish) return false;
      if (fVisibility !== "any" && e.visibility !== fVisibility) return false;
      if (fBooking !== "all" && bookingState(e) !== fBooking) return false;
      return true;
    });
  }, [data, search, fType, fVenue, fPublish, fVisibility, fBooking]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "name": return a.name.localeCompare(b.name) * dir;
        case "date": return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
        case "booked": return (a.booked - b.booked) * dir;
        case "capacity": return (a.capacity - b.capacity) * dir;
      }
    });
    return arr;
  }, [filtered, sort]);

  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const activeFilterCount =
    (fType !== "all" ? 1 : 0) +
    (fVenue !== "all" ? 1 : 0) +
    (fPublish !== "all" ? 1 : 0) +
    (fVisibility !== "any" ? 1 : 0) +
    (fBooking !== "all" ? 1 : 0);

  const kpis = useMemo(() => {
    const totalCap = data.reduce((s, e) => s + e.capacity, 0);
    const totalAvail = data.reduce((s, e) => s + availableSeats(e), 0);
    return [
      { icon: Boxes, label: "Total events", value: data.length },
      { icon: CheckCircle2, label: "Published", value: data.filter((e) => e.publish === "published").length, tone: "success" as const },
      { icon: FileEdit, label: "Draft", value: data.filter((e) => e.publish === "draft").length, tone: "info" as const },
      { icon: XCircle, label: "Cancelled", value: data.filter((e) => e.publish === "cancelled").length, tone: "destructive" as const },
      { icon: Users, label: "Total capacity", value: totalCap.toLocaleString() },
      { icon: Users, label: "Remaining seats", value: totalAvail.toLocaleString(), tone: "warning" as const },
    ];
  }, [data]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const allChecked = paged.length > 0 && paged.every((e) => selected.includes(e.id));
  const toggleAll = () =>
    setSelected(allChecked ? selected.filter((id) => !paged.find((e) => e.id === id)) : [...new Set([...selected, ...paged.map((e) => e.id)])]);

  const bulk = (action: "publish" | "unpublish" | "cancel") => {
    setData((d) => d.map((e) => selected.includes(e.id) ? { ...e, publish: action === "publish" ? "published" : action === "unpublish" ? "draft" : "cancelled" } : e));
    toast.success(`${selected.length} events ${action === "publish" ? "published" : action === "unpublish" ? "unpublished" : "cancelled"}`);
    setSelected([]);
  };

  const noop = (_n: NotificationItem) => {};

  return (
    <AppShell onOpenNotification={noop}>
      <PageHeader
        title="Inventory"
        subtitle="Manage events, capacity, visibility and publish status across all tenants."
        actions={
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Create event
          </Button>
        }
      />

      <KpiStrip items={kpis} />

      {/* Search + Filters */}
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-3 py-2">
        <div
          className={`flex items-center rounded-full transition-all duration-300 ease-out ${
            searchOpen || search ? "flex-1 bg-secondary/60 px-3" : "w-10 cursor-pointer justify-center hover:bg-secondary/60"
          } h-10`}
          onClick={() => !searchOpen && setSearchOpen(true)}
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => { if (!search) setSearchOpen(false); }}
            className={`h-9 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300 ${
              searchOpen || search ? "ml-2 flex-1 w-full px-0 opacity-100" : "w-0 p-0 opacity-0 pointer-events-none"
            }`}
          />
        </div>
        <div className="ml-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
              <FilterIcon className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={18}
            collisionPadding={24}
            className="z-[100] w-80 translate-y-1 space-y-3 rounded-2xl border border-border/70 bg-popover p-4 text-popover-foreground shadow-[0_28px_80px_-24px_hsl(var(--foreground)/0.45)] ring-1 ring-border/40 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filters</p>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => { setFType("all"); setFVenue("all"); setFPublish("all"); setFVisibility("any"); setFBooking("all"); }}>
                  Clear all
                </Button>
              )}
            </div>
            <Filter label="Type" value={fType} onChange={setFType} options={[{ v: "all", l: "All types" }, ...eventTypes.map((t) => ({ v: t, l: t }))]} />
            <Filter label="Venue" value={fVenue} onChange={setFVenue} options={[{ v: "all", l: "All venues" }, ...venues.map((v) => ({ v, l: v }))]} />
            <Filter label="Publish" value={fPublish} onChange={setFPublish} options={[
              { v: "all", l: "Any status" }, { v: "published", l: "Published" }, { v: "draft", l: "Draft" }, { v: "cancelled", l: "Cancelled" },
            ]} />
            <Filter label="Visibility" value={fVisibility} onChange={setFVisibility} options={[
              { v: "any", l: "Any visibility" }, { v: "all", l: "All tenants" }, { v: "tenant", l: "Selected tenants" }, { v: "vip", l: "VIP" },
            ]} />
            <Filter label="Booking" value={fBooking} onChange={setFBooking} options={[
              { v: "all", l: "Any booking" }, { v: "available", l: "Available" }, { v: "filling", l: "Filling" },
              { v: "almost_full", l: "Almost full" }, { v: "full", l: "Full" }, { v: "waitlist", l: "Waitlist" },
            ]} />
          </PopoverContent>
        </Popover>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-primary/40 bg-primary/5 px-4 py-2 text-sm">
          <span>{selected.length} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => bulk("publish")}>Publish</Button>
            <Button size="sm" variant="outline" onClick={() => bulk("unpublish")}>Unpublish</Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => bulk("cancel")}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-secondary/60 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-8 px-3 py-2"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></th>
                <SortableTh label="Event" sortKey="name" sort={sort} onClick={toggleSort} />
                <th className="px-3 py-2 text-left font-medium">Venue</th>
                <SortableTh label="Date" sortKey="date" sort={sort} onClick={toggleSort} />
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <SortableTh label="Capacity" sortKey="capacity" sort={sort} onClick={toggleSort} />
                <SortableTh label="Booked" sortKey="booked" sort={sort} onClick={toggleSort} />
                <th className="px-3 py-2 text-left font-medium">Available</th>
                <th className="px-3 py-2 text-left font-medium">Visibility</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((e) => {
                const checked = selected.includes(e.id);
                return (
                  <tr
                    key={e.id}
                    onClick={() => setOpenEvent(e)}
                    className="cursor-pointer border-t border-border/60 transition-colors hover:bg-secondary/40"
                  >
                    <td className="px-3 py-2" onClick={(ev) => ev.stopPropagation()}>
                      <Checkbox checked={checked} onCheckedChange={() => setSelected(checked ? selected.filter((id) => id !== e.id) : [...selected, e.id])} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{e.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{e.ref}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{e.venue}<div className="text-[10px] opacity-70">{e.city}</div></td>
                    <td className="px-3 py-2 text-muted-foreground">
                      <div className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(e.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}</span>
                      </div>
                      <div className="mt-0.5 inline-flex items-center gap-1.5 tabular-nums">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(e.date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{e.type}</td>
                    <td className="px-3 py-2 tabular-nums">{e.capacity.toLocaleString()}</td>
                    <td className="px-3 py-2 tabular-nums">{e.booked.toLocaleString()}</td>
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">{availableSeats(e).toLocaleString()}</td>
                    <td className="px-3 py-2"><span className="text-xs capitalize text-muted-foreground">{e.visibility === "vip" ? "VIP" : e.visibility === "tenant" ? `${e.tenants.length} tenants` : "All"}</span></td>
                    <td className="px-3 py-2"><div className="flex flex-col gap-1"><StatusBadge kind="publish" value={e.publish} /><StatusBadge kind="booking" value={bookingState(e)} /></div></td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr><td colSpan={10} className="px-3 py-12 text-center text-sm text-muted-foreground">No events match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
          <span>{sorted.length} events · page {page + 1} / {pages}</span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button size="sm" variant="ghost" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      <EventDetailDrawer
        event={openEvent}
        onOpenChange={(o) => !o && setOpenEvent(null)}
        onMutate={(updater) => {
          if (!openEvent) return;
          setData((d) => d.map((e) => (e.id === openEvent.id ? updater(e) : e)));
          setOpenEvent((curr) => (curr ? updater(curr) : curr));
        }}
      />
      <CreateEventDrawer open={createOpen} onOpenChange={setCreateOpen} />
    </AppShell>
  );
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[200]">{options.map((o, i) => <SelectItem key={`${o.v}-${i}`} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function SortableTh({ label, sortKey, sort, onClick, className = "" }: { label: string; sortKey: SortKey; sort: { key: SortKey; dir: "asc" | "desc" }; onClick: (k: SortKey) => void; className?: string }) {
  const active = sort.key === sortKey;
  return (
    <th className={`px-3 py-2 text-left font-medium ${className}`}>
      <button onClick={() => onClick(sortKey)} className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        {active && (sort.dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </button>
    </th>
  );
}

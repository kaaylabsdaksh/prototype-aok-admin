import { useLayoutEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";
import { AdminEnquiry, ENQUIRY_PIPELINE, ENQUIRY_STATUS_LABEL, EnquiryNote, EnquiryStatus } from "@/data/admin-enquiries";
import { team } from "@/data/admin-tenants";
import { Calendar, MapPin, Users, DollarSign, Lock, MessageCircle, Send, History } from "lucide-react";
import { toast } from "sonner";

interface Props {
  enquiry: AdminEnquiry | null;
  onOpenChange: (o: boolean) => void;
  onMutate: (updater: (e: AdminEnquiry) => AdminEnquiry) => void;
}

const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function EnquiryDetailDrawer({ enquiry, onOpenChange, onMutate }: Props) {
  const [noteText, setNoteText] = useState("");
  const [noteScope, setNoteScope] = useState<"internal" | "client">("internal");
  const tabKeys = ["overview", "notes", "timeline"] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabKeys)[number]>("overview");
  const tabsListRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  useLayoutEffect(() => {
    if (!enquiry) return;
    const measure = () => {
      const list = tabsListRef.current;
      const trigger = triggerRefs.current[activeTab];
      if (!list || !trigger) return;
      const lRect = list.getBoundingClientRect();
      const tRect = trigger.getBoundingClientRect();
      if (tRect.width === 0) return;
      setIndicator({ left: tRect.left - lRect.left, width: tRect.width, ready: true });
    };
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(measure);
      (measure as any)._raf2 = raf2;
    });
    const ro = new ResizeObserver(measure);
    if (tabsListRef.current) ro.observe(tabsListRef.current);
    return () => {
      cancelAnimationFrame(raf1);
      ro.disconnect();
    };
  }, [activeTab, enquiry]);

  if (!enquiry) return null;

  const setStatus = (status: EnquiryStatus) => {
    onMutate((e) => ({
      ...e,
      status,
      timeline: [{ at: new Date().toISOString(), status, by: "Sofia Patel" }, ...e.timeline],
    }));
    toast.success(`${enquiry.ref}: ${ENQUIRY_STATUS_LABEL[status]}`);
  };
  const assign = (id: string) => {
    onMutate((e) => ({ ...e, assignedTo: id }));
    toast.success(`Assigned to ${team.find((t) => t.id === id)?.name}`);
  };
  const addNote = () => {
    if (!noteText.trim()) return;
    const note: EnquiryNote = {
      id: `n-${Date.now()}`, author: "Sofia Patel", initials: "SP",
      at: new Date().toISOString(), body: noteText.trim(), scope: noteScope,
    };
    onMutate((e) => ({ ...e, notes: [note, ...e.notes] }));
    setNoteText("");
    toast.success(noteScope === "client" ? "Client-facing update posted" : "Internal note added");
  };

  const assigneeName = enquiry.assignedTo ? team.find((t) => t.id === enquiry.assignedTo)?.name : "Unassigned";

  return (
    <Sheet open={!!enquiry} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{enquiry.ref}</span>
            <StatusBadge kind="enquiry" value={enquiry.status} />
          </div>
          <SheetTitle className="text-xl">{enquiry.eventType} — {enquiry.tenantName}</SheetTitle>
          <SheetDescription className="flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{fmt(enquiry.preferredDate)}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{enquiry.location}</span>
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{enquiry.guests}</span>
            <span className="inline-flex items-center gap-1"><DollarSign className="h-3 w-3" />{enquiry.budget.toLocaleString()}</span>
          </SheetDescription>
        </SheetHeader>

        {/* Pipeline */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-3">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Status</p>
          <div className="flex flex-wrap gap-1.5">
            {ENQUIRY_PIPELINE.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={enquiry.status === s ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={() => setStatus(s)}
              >
                {ENQUIRY_STATUS_LABEL[s]}
              </Button>
            ))}
            <Button
              size="sm"
              variant={enquiry.status === "declined" ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setStatus("declined")}
            >
              Decline
            </Button>
          </div>
        </div>

        {/* Assignment */}
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-card p-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Assigned to</p>
            <p className="text-sm font-medium">{assigneeName}</p>
          </div>
          <Select value={enquiry.assignedTo ?? ""} onValueChange={assign}>
            <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Assign…" /></SelectTrigger>
            <SelectContent>{team.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mt-4">
          <TabsList
            ref={tabsListRef}
            className="relative flex w-full items-center justify-between border-b border-border bg-transparent p-0 h-auto"
          >
            {tabKeys.map((key) => (
              <TabsTrigger
                key={key}
                ref={(el) => (triggerRefs.current[key] = el)}
                value={key}
                className="relative flex-1 rounded-none bg-transparent pb-3 text-[13px] font-medium text-muted-foreground shadow-none transition-colors duration-200 hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                {key === "overview" ? "Overview" : key === "notes" ? "Notes" : "Timeline"}
              </TabsTrigger>
            ))}
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-primary transition-all duration-300 ease-out"
              style={{
                left: indicator.left,
                width: indicator.width,
                opacity: indicator.ready ? 1 : 0,
              }}
            />
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-3 text-sm">
            <Section title="Brief">{enquiry.brief}</Section>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact" value={enquiry.contactName} />
              <Field label="Email" value={enquiry.contactEmail} />
              <Field label="Submitted" value={fmt(enquiry.submittedAt)} />
              <Field label="Tenant" value={enquiry.tenantName} />
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-4 space-y-3">
            <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
              <div className="flex gap-1">
                <Button size="sm" variant={noteScope === "internal" ? "default" : "outline"} onClick={() => setNoteScope("internal")} className="h-7 gap-1 text-xs">
                  <Lock className="h-3 w-3" /> Internal
                </Button>
                <Button size="sm" variant={noteScope === "client" ? "default" : "outline"} onClick={() => setNoteScope("client")} className="h-7 gap-1 text-xs">
                  <MessageCircle className="h-3 w-3" /> Client-facing
                </Button>
              </div>
              <Textarea rows={3} placeholder={noteScope === "internal" ? "Internal note — only visible to AOK team" : "Update visible to Requester / CEM users"} value={noteText} onChange={(e) => setNoteText(e.target.value)} />
              <div className="flex justify-end">
                <Button size="sm" onClick={addNote} className="gap-1"><Send className="h-3 w-3" /> Post</Button>
              </div>
            </div>
            <ol className="space-y-2">
              {enquiry.notes.map((n) => (
                <li key={n.id} className={`rounded-xl border px-3 py-2 ${n.scope === "internal" ? "border-warning/30 bg-warning/5" : "border-info/30 bg-info/5"}`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="inline-flex items-center gap-1 font-medium">
                      {n.scope === "internal" ? <Lock className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
                      {n.author} · {n.scope === "internal" ? "Internal" : "Client-facing"}
                    </span>
                    <time className="text-muted-foreground">{fmt(n.at)}</time>
                  </div>
                  <p className="mt-1 text-sm">{n.body}</p>
                </li>
              ))}
              {enquiry.notes.length === 0 && (
                <p className="rounded-xl bg-secondary/40 px-3 py-6 text-center text-xs text-muted-foreground">No notes yet.</p>
              )}
            </ol>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <div className="flex items-center gap-2 px-1 text-xs uppercase tracking-wide text-muted-foreground">
              <History className="h-3.5 w-3.5" /> Activity
            </div>
            <ol className="mt-2 space-y-2">
              {enquiry.timeline.map((t, i) => (
                <li key={i} className="rounded-xl border border-border bg-card px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge kind="enquiry" value={t.status} />
                    <time className="text-[11px] text-muted-foreground">{fmt(t.at)}</time>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">By {t.by}{t.note ? ` — ${t.note}` : ""}</p>
                </li>
              ))}
            </ol>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm">{children}</p>
    </div>
  );
}

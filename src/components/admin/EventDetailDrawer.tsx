import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "./StatusBadge";
import {
  AdminEvent, utilisation, availableSeats, bookingState, eventTypes,
} from "@/data/admin-inventory";
import { tenants, userGroups } from "@/data/admin-tenants";
import { Calendar, MapPin, Users, AlertTriangle, ImageIcon, ShieldCheck, History, Pencil, X, Check } from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { toast } from "sonner";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Props {
  event: AdminEvent | null;
  onOpenChange: (open: boolean) => void;
  onMutate: (updater: (e: AdminEvent) => AdminEvent) => void;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function EventDetailDrawer({ event, onOpenChange, onMutate }: Props) {
  if (!event) return null;
  const pct = utilisation(event);
  const tenantNames = event.tenants.map((id) => tenants.find((t) => t.id === id)?.name).filter(Boolean) as string[];
  const groupNames = event.groups.map((id) => userGroups.find((g) => g.id === id)?.name).filter(Boolean) as string[];

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AdminEvent>(event);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ next: AdminEvent["publish"]; label: string; title: string; description: string } | null>(null);
  useEffect(() => { setDraft(event); setEditing(false); setConfirmOpen(false); setPendingAction(null); }, [event.id]);

  const update = <K extends keyof AdminEvent>(key: K, value: AdminEvent[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const hasChanges = (() => {
    const keys: (keyof AdminEvent)[] = ["name","venue","city","type","dressCode","description","capacity","date","bookingDeadline"];
    return keys.some((k) => draft[k] !== event[k]);
  })();

  const cancelEdit = () => {
    if (hasChanges) { setConfirmOpen(true); return; }
    setDraft(event); setEditing(false);
  };
  const confirmDiscard = () => { setConfirmOpen(false); setDraft(event); setEditing(false); };
  const saveEdit = () => {
    const changes: string[] = [];
    (["name","venue","city","type","dressCode","description","capacity","date","bookingDeadline"] as const).forEach((k) => {
      if (draft[k] !== event[k]) changes.push(k);
    });
    onMutate((e) => ({
      ...e,
      ...draft,
      audit: changes.length
        ? [{ at: new Date().toISOString(), actor: "Sofia Patel", action: `Edited ${changes.join(", ")}` }, ...e.audit]
        : e.audit,
    }));
    setEditing(false);
    toast.success(changes.length ? `${event.ref}: changes saved` : "No changes");
  };


  const publish = (next: AdminEvent["publish"], label: string) => {
    onMutate((e) => ({
      ...e,
      publish: next,
      audit: [{ at: new Date().toISOString(), actor: "Sofia Patel", action: label }, ...e.audit],
    }));
    toast.success(`${event.ref}: ${label}`);
  };

  const requestConfirm = (next: AdminEvent["publish"], label: string, title: string, description: string) =>
    setPendingAction({ next, label, title, description });

  const confirmAction = () => {
    if (!pendingAction) return;
    publish(pendingAction.next, pendingAction.label);
    setPendingAction(null);
  };

  const tabKeys = ["overview", "bookings", "visibility", "audit"] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabKeys)[number]>("overview");
  const tabsListRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number; ready: boolean }>({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const measure = () => {
      const list = tabsListRef.current;
      const trigger = triggerRefs.current[activeTab];
      if (!list || !trigger) return;
      const listRect = list.getBoundingClientRect();
      const tRect = trigger.getBoundingClientRect();
      if (tRect.width === 0) return;
      setIndicator({ left: tRect.left - listRect.left, width: tRect.width, ready: true });
    };
    measure();
    const raf1 = requestAnimationFrame(measure);
    const raf2 = requestAnimationFrame(() => requestAnimationFrame(measure));
    const list = tabsListRef.current;
    const ro = list ? new ResizeObserver(measure) : null;
    if (ro && list) ro.observe(list);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [activeTab, editing, event.id]);

  return (
    <Sheet open={!!event} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-xl">
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
        <SheetHeader className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                {event.ref}
              </span>
              <StatusBadge kind="publish" value={event.publish} />
              <StatusBadge kind="booking" value={bookingState(event)} />
              {editing && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">Editing</span>
              )}
            </div>
          </div>
          {editing ? (
            <>
              <Input
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
                className="h-10 text-xl font-semibold"
              />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Input value={draft.venue} onChange={(e) => update("venue", e.target.value)} placeholder="Venue" className="h-9 text-xs" />
                <Input value={draft.city} onChange={(e) => update("city", e.target.value)} placeholder="City" className="h-9 text-xs" />
                <div className="col-span-2">
                  <DateTimePicker
                    value={draft.date}
                    onChange={(v) => update("date", v)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <SheetTitle className="text-2xl font-semibold tracking-tight">{event.name}</SheetTitle>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-muted-foreground/70" />
                  <span>{event.venue}, {event.city}</span>
                </div>
                <div className="h-3 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground/70" />
                  <span>{fmt(event.date)}</span>
                </div>
              </div>
            </>
          )}
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mt-5">
          <TabsList
            ref={tabsListRef}
            className="relative flex w-full items-center justify-between border-b border-border bg-transparent p-0 h-auto"
          >
            {tabKeys.map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                ref={(el) => (triggerRefs.current[key] = el)}
                className="relative flex-1 pb-3 text-[13px] font-medium text-muted-foreground transition-colors duration-200 data-[state=active]:font-semibold data-[state=active]:text-primary hover:text-foreground"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </TabsTrigger>
            ))}
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ left: indicator.left, width: indicator.width, opacity: indicator.ready ? 1 : 0 }}
            />
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4 text-sm">
            {editing ? (
              <EditableSection title="Description">
                <Textarea value={draft.description} onChange={(e) => update("description", e.target.value)} rows={3} className="text-sm" />
              </EditableSection>
            ) : (
              <Section title="Description">{event.description}</Section>
            )}
            <div className="grid grid-cols-2 gap-3">
              {editing ? (
                <>
                  <EditField label="Type">
                    <Select value={draft.type} onValueChange={(v) => update("type", v as AdminEvent["type"])}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent className="z-[200]">
                        {eventTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </EditField>
                  <EditField label="Dress code">
                    <Input value={draft.dressCode} onChange={(e) => update("dressCode", e.target.value)} className="h-9 text-sm" />
                  </EditField>
                  <EditField label="Capacity">
                    <Input
                      type="number"
                      min={0}
                      value={draft.capacity}
                      onChange={(e) => update("capacity", Math.max(0, Number(e.target.value) || 0))}
                      className="h-9 text-sm tabular-nums"
                    />
                  </EditField>
                  <EditField label="Booking deadline">
                    <DateTimePicker
                      value={draft.bookingDeadline}
                      onChange={(v) => update("bookingDeadline", v)}
                    />
                  </EditField>
                </>
              ) : (
                <>
                  <Field label="Type" value={event.type} />
                  <Field label="Dress code" value={event.dressCode} />
                  <Field label="Capacity" value={event.capacity.toLocaleString()} />
                  <Field label="Booking deadline" value={fmt(event.bookingDeadline)} />
                </>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5" /> {event.images} image{event.images === 1 ? "" : "s"} uploaded
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Booked" value={event.booked} icon={Users} />
              <Metric label="Available" value={availableSeats(event)} icon={Users} />
              <Metric label="Waitlist" value={event.waitlist} icon={AlertTriangle} />
              <Metric label="Utilisation" value={`${pct}%`} icon={Users} />
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Capacity utilisation</span><span>{pct}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visibility" className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Scope
              </div>
              <p className="mt-1 font-medium capitalize">{event.visibility === "all" ? "All tenants" : event.visibility === "vip" ? "VIP / restricted" : "Selected tenants"}</p>
            </div>
            <Section title="Tenants">{tenantNames.length ? tenantNames.join(", ") : "All tenants"}</Section>
            <Section title="User groups">{groupNames.length ? groupNames.join(", ") : "—"}</Section>
            {event.visibility === "vip" && (
              <p className="rounded-lg bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
                VIP-only — completely hidden from unauthorised users.
              </p>
            )}
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <div className="flex items-center gap-2 px-1 text-xs uppercase tracking-wide text-muted-foreground">
              <History className="h-3.5 w-3.5" /> Audit trail
            </div>
            <ol className="mt-2 space-y-2">
              {event.audit.map((a, i) => (
                <li key={i} className="rounded-xl border border-border bg-card px-3 py-2 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{a.action}</span>
                    <time className="text-[11px] text-muted-foreground">{fmt(a.at)}</time>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">By {a.actor}</p>
                </li>
              ))}
            </ol>
          </TabsContent>
        </Tabs>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-border/60 bg-background/80 px-6 py-3 backdrop-blur-md shadow-[0_-8px_30px_hsl(var(--foreground)/0.04)]">
          {editing ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={!hasChanges}
                  className="group flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-muted-foreground disabled:active:scale-100"
                >
                  <X className="h-4 w-4 text-muted-foreground/70 transition-colors group-hover:text-foreground/70" />
                  Cancel
                </button>
                {!hasChanges && (
                  <span className="text-xs text-muted-foreground">No changes to discard</span>
                )}
              </div>
              <button
                type="button"
                onClick={saveEdit}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-95"
              >
                <Check className="h-4 w-4" />
                Save changes
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="group flex items-center gap-2.5 rounded-lg px-4 py-2 text-[13px] font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground active:scale-95"
              >
                <Pencil className="h-4 w-4 text-muted-foreground/70 transition-colors group-hover:text-foreground/70" />
                Edit
              </button>
              <div className="flex items-center gap-2">
                {event.publish !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() =>
                      requestConfirm(
                        "cancelled",
                        "Cancelled event",
                        "Cancel this event?",
                        "Cancelling will make the event unavailable and notify all attendees."
                      )
                    }
                    className="rounded-full border border-destructive/20 bg-background px-5 py-2 text-[13px] font-semibold text-destructive transition-all duration-200 hover:border-destructive/40 hover:bg-destructive/5 hover:shadow-sm active:scale-95"
                  >
                    Cancel event
                  </button>
                )}
                {(event.publish !== "published" && event.publish !== "cancelled") || event.publish === "published" ? (
                  <div className="mx-1 h-5 w-px bg-border" />
                ) : null}
                {event.publish !== "published" && event.publish !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() =>
                      requestConfirm(
                        "published",
                        "Published event",
                        "Publish this event?",
                        "Publishing will make the event visible to all eligible users."
                      )
                    }
                    className="rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-95"
                  >
                    Publish
                  </button>
                )}
                {event.publish === "published" && (
                  <button
                    type="button"
                    onClick={() =>
                      requestConfirm(
                        "draft",
                        "Unpublished event",
                        "Unpublish this event?",
                        "Unpublishing will hide the event from users. Existing bookings will remain."
                      )
                    }
                    className="rounded-full border border-border bg-background px-5 py-2 text-[13px] font-semibold text-foreground transition-all duration-200 hover:bg-muted/50 hover:shadow-sm active:scale-95"
                  >
                    Unpublish
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits. If you leave, your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>{pendingAction?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingAction(null)}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

function EditableSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Calendar }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

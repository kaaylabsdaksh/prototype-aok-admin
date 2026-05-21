import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { tenants, userGroups } from "@/data/admin-tenants";
import { eventTypes } from "@/data/admin-inventory";
import { Upload, ImageIcon, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-time-picker";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = ["Details", "Imagery", "Visibility", "Review"] as const;

export function CreateEventDrawer({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", venue: "", date: "", capacity: "",
    type: eventTypes[0] as string, description: "", dressCode: "", deadline: "",
    visibility: "tenant" as "all" | "tenant" | "vip",
    tenants: [] as string[], groups: [] as string[],
    images: [] as string[], cover: 0,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggleArr = (k: "tenants" | "groups", id: string) =>
    set(k, form[k].includes(id) ? form[k].filter((x) => x !== id) : [...form[k], id]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).map((f) => f.name);
    set("images", [...form.images, ...files].slice(0, 8));
  };
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).map((f) => f.name);
    set("images", [...form.images, ...files].slice(0, 8));
  };

  const submit = () => {
    toast.success(`Event "${form.name || "Untitled"}" created as draft`);
    onOpenChange(false);
    setStep(0);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="text-left">
          <SheetTitle>Create new event</SheetTitle>
          <SheetDescription>
            Step {step + 1} of {steps.length} · {steps[step]}
          </SheetDescription>
        </SheetHeader>

        <ol className="mt-4 flex gap-1">
          {steps.map((s, i) => (
            <li key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </ol>

        <div className="mt-6 space-y-4">
          {step === 0 && (
            <>
              <Row label="Event name"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Chelsea vs Arsenal" /></Row>
              <Row label="Venue"><Input value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Venue & city" /></Row>
              <div className="grid grid-cols-2 gap-3">
                <Row label="Date & time"><DateTimePicker value={form.date} onChange={(v) => set("date", v)} /></Row>
                <Row label="Capacity"><Input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} /></Row>
              </div>
              <Row label="Event type">
                <Select value={form.type} onValueChange={(v) => set("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{eventTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </Row>
              <Row label="Description"><Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></Row>
              <div className="grid grid-cols-2 gap-3">
                <Row label="Dress code"><Input value={form.dressCode} onChange={(e) => set("dressCode", e.target.value)} /></Row>
                <Row label="Booking deadline"><DateTimePicker value={form.deadline} onChange={(v) => set("deadline", v)} /></Row>
              </div>
            </>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/40 py-10 text-center"
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium">Drag & drop images here</p>
                <p className="text-xs text-muted-foreground">or</p>
                <label className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                  Choose files
                  <input type="file" multiple accept="image/*" className="hidden" onChange={onPick} />
                </label>
              </div>
              {form.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {form.images.map((name, i) => (
                    <button
                      key={i}
                      onClick={() => set("cover", i)}
                      className={`group relative flex aspect-video items-center justify-center rounded-lg border bg-card text-[10px] text-muted-foreground ${form.cover === i ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                    >
                      <ImageIcon className="h-5 w-5 opacity-50" />
                      <span className="absolute bottom-1 left-1 right-1 truncate">{name}</span>
                      {form.cover === i && (
                        <Badge className="absolute right-1 top-1 h-5 px-1.5 text-[10px]">Cover</Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <>
              <Row label="Visibility scope">
                <Select value={form.visibility} onValueChange={(v) => set("visibility", v as typeof form.visibility)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tenants</SelectItem>
                    <SelectItem value="tenant">Selected tenants</SelectItem>
                    <SelectItem value="vip">VIP / restricted</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Tenants</p>
                <div className="space-y-1.5 rounded-xl border border-border bg-card p-3">
                  {tenants.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={form.tenants.includes(t.id)} onCheckedChange={() => toggleArr("tenants", t.id)} />
                      <span>{t.name}</span>
                      <span className="ml-auto text-[11px] text-muted-foreground">{t.plan}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">User groups</p>
                <div className="space-y-1.5 rounded-xl border border-border bg-card p-3">
                  {userGroups.map((g) => (
                    <label key={g.id} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={form.groups.includes(g.id)} onCheckedChange={() => toggleArr("groups", g.id)} />
                      <span>{g.name}</span>
                      <span className="ml-auto text-[11px] text-muted-foreground capitalize">{g.kind}</span>
                    </label>
                  ))}
                </div>
              </div>
              {form.visibility === "vip" && (
                <p className="rounded-lg bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
                  VIP events stay completely hidden from unauthorised users.
                </p>
              )}
            </>
          )}

          {step === 3 && (
            <div className="space-y-2 text-sm">
              <Summary label="Name" value={form.name || "Untitled"} />
              <Summary label="Venue" value={form.venue || "—"} />
              <Summary label="Date" value={form.date || "—"} />
              <Summary label="Capacity" value={form.capacity || "—"} />
              <Summary label="Type" value={form.type} />
              <Summary label="Visibility" value={form.visibility} />
              <Summary label="Tenants" value={form.tenants.length ? `${form.tenants.length} selected` : "All / none"} />
              <Summary label="Groups" value={form.groups.length ? `${form.groups.length} selected` : "—"} />
              <Summary label="Images" value={`${form.images.length} uploaded`} />
            </div>
          )}
        </div>

        <SheetFooter className="mt-6 flex flex-row justify-between gap-2">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
          ) : (
            <Button onClick={submit}><Check className="h-4 w-4" /> Save as draft</Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="max-w-[60%] truncate text-sm font-medium">{value}</span>
    </div>
  );
}

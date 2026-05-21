import { cn } from "@/lib/utils";
import type { PublishStatus, BookingStatus } from "@/data/admin-inventory";
import type { EnquiryStatus } from "@/data/admin-enquiries";

const publishMap: Record<PublishStatus, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-muted text-muted-foreground ring-border" },
  published: { label: "Published", cls: "bg-success/15 text-success ring-success/30" },
  cancelled: { label: "Cancelled", cls: "bg-destructive/10 text-destructive ring-destructive/30" },
};

const bookingMap: Record<BookingStatus, { label: string; cls: string }> = {
  available:   { label: "Available",   cls: "bg-info/10 text-info ring-info/30" },
  filling:     { label: "Filling",     cls: "bg-info/10 text-info ring-info/30" },
  almost_full: { label: "Almost full", cls: "bg-warning/15 text-warning ring-warning/30" },
  full:        { label: "Full",        cls: "bg-success/15 text-success ring-success/30" },
  waitlist:    { label: "Waitlist",    cls: "bg-accent text-accent-foreground ring-accent-foreground/20" },
};

const enquiryMap: Record<EnquiryStatus, { label: string; cls: string }> = {
  received:      { label: "Received",      cls: "bg-muted text-muted-foreground ring-border" },
  in_progress:   { label: "In Progress",   cls: "bg-info/10 text-info ring-info/30" },
  proposal_sent: { label: "Proposal Sent", cls: "bg-warning/15 text-warning ring-warning/30" },
  confirmed:     { label: "Confirmed",     cls: "bg-success/15 text-success ring-success/30" },
  declined:      { label: "Declined",      cls: "bg-destructive/10 text-destructive ring-destructive/30" },
};

interface Props {
  kind: "publish" | "booking" | "enquiry";
  value: string;
  className?: string;
}

export function StatusBadge({ kind, value, className }: Props) {
  const map = kind === "publish" ? publishMap : kind === "booking" ? bookingMap : enquiryMap;
  const entry = (map as Record<string, { label: string; cls: string }>)[value];
  if (!entry) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
        entry.cls,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {entry.label}
    </span>
  );
}

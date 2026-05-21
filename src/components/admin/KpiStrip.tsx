import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Kpi {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delta?: string;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
}

const toneText: Record<NonNullable<Kpi["tone"]>, string> = {
  default: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-info",
};

export function KpiStrip({ items }: { items: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {items.map(({ icon: Icon, label, value, delta, tone = "default" }) => (
        <div
          key={label}
          className="rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-xs transition-colors hover:border-primary/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-semibold tabular-nums">{value}</span>
            {delta && <span className={cn("text-[11px] font-medium", toneText[tone])}>{delta}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

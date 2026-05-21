import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface DateTimePickerProps {
  /** ISO string, "yyyy-MM-ddTHH:mm" local string, or empty */
  value?: string;
  onChange: (iso: string) => void;
  mode?: "date" | "datetime";
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Override calendar disabled-days predicate */
  disabledDays?: (date: Date) => boolean;
}

function parseValue(v?: string): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}

/**
 * Unified date / date-time picker for the design system.
 * Pill month + year navigation, clean grid (matches Calendar component).
 */
export function DateTimePicker({
  value,
  onChange,
  mode = "datetime",
  placeholder,
  className,
  disabled,
  disabledDays,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = parseValue(value);

  const commit = (next: Date) => {
    onChange(next.toISOString());
  };

  const onSelectDay = (day?: Date) => {
    if (!day) return;
    const base = date ?? new Date();
    const next = new Date(day);
    if (mode === "datetime") {
      next.setHours(base.getHours(), base.getMinutes(), 0, 0);
    } else {
      next.setHours(0, 0, 0, 0);
    }
    commit(next);
    if (mode === "date") setOpen(false);
  };

  const onPickTime = (h: number, m: number) => {
    const base = date ?? new Date();
    const next = new Date(base);
    next.setHours(h, m, 0, 0);
    commit(next);
  };

  const label = date
    ? mode === "datetime"
      ? format(date, "PP · HH:mm")
      : format(date, "PP")
    : placeholder ?? (mode === "datetime" ? "Pick date & time" : "Pick a date");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start gap-2 rounded-xl font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 opacity-70" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="z-[200] w-auto rounded-2xl border border-border/70 p-0 shadow-[0_28px_80px_-24px_hsl(var(--foreground)/0.35)]"
      >
        <div className="flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelectDay}
            initialFocus
            disabled={disabledDays}
          />
          {mode === "datetime" && <TimeList date={date} onPick={onPickTime} />}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TimeList({ date, onPick }: { date?: Date; onPick: (h: number, m: number) => void }) {
  const slots = React.useMemo(() => {
    const list: { h: number; m: number; label: string; ampm: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of [0, 30]) {
        const period = h < 12 ? "AM" : "PM";
        const hh = ((h + 11) % 12) + 1;
        list.push({
          h,
          m,
          label: `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
          ampm: period,
        });
      }
    }
    return list;
  }, []);

  const selectedKey = date ? `${date.getHours()}-${date.getMinutes() < 30 ? 0 : 30}` : null;
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!listRef.current || !selectedKey) return;
    const el = listRef.current.querySelector<HTMLButtonElement>(`[data-key="${selectedKey}"]`);
    el?.scrollIntoView({ block: "center" });
  }, [selectedKey]);

  return (
    <div className="w-[180px] border-l border-border/60">
      <div className="px-4 pb-2 pt-3 text-base font-semibold">
        {date ? format(date, "hh:mm a") : "Pick time"}
      </div>
      <div className="mx-3 border-t border-border/60" />
      <div ref={listRef} className="max-h-[260px] overflow-y-auto px-2 py-2">
        {slots.map((s) => {
          const key = `${s.h}-${s.m}`;
          const selected = key === selectedKey;
          return (
            <button
              key={key}
              data-key={key}
              type="button"
              onClick={() => onPick(s.h, s.m)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm tabular-nums transition-colors",
                selected
                  ? "bg-secondary font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <span>{s.label}</span>
              <span className={cn("text-xs", selected ? "font-semibold" : "")}>{s.ampm}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
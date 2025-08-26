"use client";

import { type FC, useCallback, useMemo, useState } from "react";
import { addMonths, format } from "date-fns";
import { it } from "date-fns/locale";
import { type DateRange as DayPickerDateRange } from "react-day-picker";
import { RiCalendarLine } from "@remixicon/react";
import { Check } from "lucide-react";
import CloseIcon from "@/components/icons/close";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { FaCalendar } from "react-icons/fa6";

export interface DateField {
  value: string;
  label: string;
}

interface DateRangeFilterProps {
  dateRange: DayPickerDateRange | undefined;
  onDateRangeChange: (range: DayPickerDateRange | undefined) => void;
  dateField: string;
  onDateFieldChange: (field: string) => void;
  availableDateFields: DateField[];
  className?: string;
  align?: "start" | "center" | "end";
  onPresetChange?: (preset: { key: string; view: "day" | "month" }) => void;
}

export const DateRangeFilter: FC<DateRangeFilterProps> = ({
  dateRange,
  onDateRangeChange,
  dateField,
  onDateFieldChange,
  availableDateFields,
  className,
  align = "end",
  onPresetChange,
}) => {
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [displayMonths, setDisplayMonths] = useState<[Date, Date]>([
    new Date(),
    addMonths(new Date(), 1),
  ]);
  const isMobile = useIsMobile();

  const getDateFilterDisplay = useCallback(() => {
    if (dateRange?.from && dateRange?.to) {
      if (
        format(dateRange.from, "yyyy-MM-dd") ===
        format(dateRange.to, "yyyy-MM-dd")
      ) {
        return format(dateRange.from, "dd MMM yyyy", { locale: it });
      }
      return `${format(dateRange.from, "dd MMM", { locale: it })} - ${format(
        dateRange.to,
        "dd MMM yyyy",
        { locale: it },
      )}`;
    }
    if (dateRange?.from) {
      return `Da ${format(dateRange.from, "dd MMM yyyy", { locale: it })}`;
    }
    if (dateRange?.to) {
      return `A ${format(dateRange.to, "dd MMM yyyy", { locale: it })}`;
    }
    return "Filtra per data";
  }, [dateRange]);

  const quickDatePresets = useMemo(
    () => [
      {
        label: "7 giorni",
        value: "last7days",
        view: "day" as const,
        getDates: (): [Date, Date] => {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - 6);
          return [start, end];
        },
      },
      {
        label: "30 giorni",
        value: "last30days",
        view: "day" as const,
        getDates: (): [Date, Date] => {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - 29);
          return [start, end];
        },
      },
      {
        label: "3 mesi",
        value: "last3months",
        view: "month" as const,
        getDates: (): [Date, Date] => {
          const now = new Date();
          const end = new Date();
          const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          return [start, end];
        },
      },
      {
        label: "6 mesi",
        value: "last6months",
        view: "month" as const,
        getDates: (): [Date, Date] => {
          const now = new Date();
          const end = new Date();
          const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          return [start, end];
        },
      },
      {
        label: "1 anno",
        value: "last12months",
        view: "month" as const,
        getDates: (): [Date, Date] => {
          const now = new Date();
          const end = new Date();
          const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
          return [start, end];
        },
      },
      {
        label: "Totale",
        value: "total",
        view: "month" as const,
        getDates: (): [Date, Date] => {
          const end = new Date();
          const start = new Date(1970, 0, 1);
          return [start, end];
        },
      },
    ],
    [],
  );

  const handleQuickPreset = useCallback(
    (preset: (typeof quickDatePresets)[0]) => {
      // "Totale" non ha un range definito dall'utente, lasciamo decidere al chiamante
      if (preset.value === "total") {
        onDateRangeChange(undefined);
        onPresetChange?.({ key: preset.value, view: preset.view });
        setDateFilterOpen(false);
        return;
      }
      const [start, end] = preset.getDates();
      onDateRangeChange({ from: start, to: end });
      onPresetChange?.({ key: preset.value, view: preset.view });
      setDateFilterOpen(false);
    },
    [onDateRangeChange, quickDatePresets, onPresetChange],
  );

  const getActivePreset = useCallback(() => {
    if (!dateRange?.from || !dateRange?.to) {
      // Se non c'è range, consideriamo "Totale" come attivo
      return quickDatePresets.find((p) => p.value === "total") ?? null;
    }
    return quickDatePresets.find((preset) => {
      const [presetStart, presetEnd] = preset.getDates();
      return (
        dateRange.from?.toDateString() === presetStart.toDateString() &&
        dateRange.to?.toDateString() === presetEnd.toDateString()
      );
    });
  }, [dateRange, quickDatePresets]);

  const activePreset = getActivePreset();

  const triggerLabel = useMemo(() => {
    if (activePreset) {
      // Se il preset attivo è "total", mostra "Filtra per data" nel bottone principale
      if (activePreset.value === "total") {
        return "Filtra per data";
      }
      return activePreset.label;
    }
    return getDateFilterDisplay();
  }, [activePreset, getDateFilterDisplay]);

  return (
    <div className={cn("group relative", className)}>
      <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "ring-border bg-card relative rounded-full border-none ring-1 transition-all",
              (dateRange?.from ?? dateRange?.to) &&
                "border-primary/40 bg-primary/10 text-primary",
            )}
            aria-label={`Filtro data: ${triggerLabel}`}
          >
            <FaCalendar
              className={cn(
                "text-muted-foreground/50 mb-0.5 size-4",
                (dateRange?.from ?? dateRange?.to) && "text-primary",
              )}
              size={16}
              aria-hidden="true"
            />
            <span className={cn("text-sm")}>{triggerLabel}</span>
            {(dateRange?.from ?? dateRange?.to) && (
              <div
                role="button"
                tabIndex={0}
                aria-label="Cancella filtro data"
                className="group/clear -mr-2 ml-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDateRangeChange(undefined);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onDateRangeChange(undefined);
                  }
                }}
              >
                <CloseIcon
                  size={16}
                  className="text-muted-foreground/60 group-hover/clear:text-foreground transition-colors"
                  strokeWidth={2.2}
                />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto max-w-[95vw] rounded-2xl p-0"
          align={align}
          sideOffset={8}
        >
          <div className={cn("flex", isMobile && "flex-col")}>
            <div
              className={cn(
                "flex flex-col",
                isMobile ? "border-b" : "border-r",
              )}
            >
              <div className="border-b p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/20 ring-border flex h-10 items-center justify-center rounded-md border-none px-3 text-center ring-1">
                    <span className="text-sm font-medium">
                      {dateRange?.from
                        ? format(dateRange.from, "dd MMM, yyyy", {
                            locale: it,
                          })
                        : "Data di inizio"}
                    </span>
                  </div>
                  <div className="bg-muted/20 ring-border flex h-10 items-center justify-center rounded-md border-none px-3 text-center ring-1">
                    <span className="text-sm font-medium">
                      {dateRange?.to
                        ? format(dateRange.to, "dd MMM, yyyy", {
                            locale: it,
                          })
                        : "Data di fine"}
                    </span>
                  </div>
                </div>
              </div>
              {isMobile ? (
                <Calendar
                  locale={it}
                  mode="range"
                  selected={dateRange}
                  onSelect={onDateRangeChange}
                  numberOfMonths={1}
                  className="p-3"
                />
              ) : (
                <div className="flex gap-4 overflow-x-auto p-3">
                  <Calendar
                    locale={it}
                    mode="range"
                    selected={dateRange}
                    onSelect={onDateRangeChange}
                    month={displayMonths[0]}
                    onMonthChange={(month) =>
                      setDisplayMonths([month, displayMonths[1]])
                    }
                    toMonth={addMonths(displayMonths[1], -1)}
                    showOutsideDays={false}
                    className="flex-shrink-0"
                  />
                  <Calendar
                    locale={it}
                    mode="range"
                    selected={dateRange}
                    onSelect={onDateRangeChange}
                    month={displayMonths[1]}
                    onMonthChange={(month) =>
                      setDisplayMonths([displayMonths[0], month])
                    }
                    fromMonth={addMonths(displayMonths[0], 1)}
                    showOutsideDays={false}
                    className="flex-shrink-0"
                  />
                </div>
              )}
            </div>

            <div
              className={cn(
                "bg-muted/30 flex flex-col justify-between p-4",
                isMobile
                  ? "w-full rounded-b-2xl"
                  : "w-[260px] min-w-[240px] flex-shrink-0 rounded-r-2xl",
              )}
            >
              <div className="flex h-full flex-col justify-between">
                <div className="ring-border bg-background/90 rounded-lg border-none ring-1">
                  <p className="text-muted-foreground flex justify-center p-2 text-sm font-medium uppercase">
                    Filtra per
                  </p>
                  <div className="bg-card ring-border flex flex-col gap-2 rounded-2xl p-2 ring-1">
                    {availableDateFields.map((field) => (
                      <Button
                        key={field.value}
                        variant={
                          dateField === field.value ? "secondary" : "ghost"
                        }
                        onClick={() => onDateFieldChange(field.value)}
                        className={cn(
                          "h-auto justify-start rounded-md px-3 py-2 text-sm",
                          dateField === field.value &&
                            "bg-muted/20 ring-border ring-1",
                        )}
                      >
                        {field.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="ring-border bg-background/90 rounded-lg border-none ring-1">
                  <p className="text-muted-foreground flex justify-center p-2 text-sm font-medium uppercase">
                    Preset Rapidi
                  </p>
                  <div className="bg-card ring-border grid grid-cols-2 gap-2 rounded-2xl p-2 ring-1">
                    {quickDatePresets.map((preset) => (
                      <Button
                        key={preset.value}
                        variant={
                          activePreset?.value === preset.value
                            ? "secondary"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handleQuickPreset(preset)}
                        className={cn(
                          "ring-border h-auto rounded-md border-none px-3 py-2 text-sm ring-1",
                          activePreset?.value === preset.value && "bg-muted/20",
                        )}
                        aria-pressed={activePreset?.value === preset.value}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {preset.label}
                          {activePreset?.value === preset.value && (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

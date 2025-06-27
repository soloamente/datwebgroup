"use client";

import { type FC, useCallback, useMemo, useState } from "react";
import { addMonths, format } from "date-fns";
import { it } from "date-fns/locale";
import { type DateRange as DayPickerDateRange } from "react-day-picker";
import { RiCalendarLine } from "@remixicon/react";
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
}

export const DateRangeFilter: FC<DateRangeFilterProps> = ({
  dateRange,
  onDateRangeChange,
  dateField,
  onDateFieldChange,
  availableDateFields,
  className,
  align = "end",
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
        label: "Oggi",
        value: "today",
        getDates: (): [Date, Date] => {
          const today = new Date();
          return [today, today];
        },
      },
      {
        label: "7 giorni",
        value: "last7days",
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
        getDates: (): [Date, Date] => {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - 29);
          return [start, end];
        },
      },
      {
        label: "Mese",
        value: "thisMonth",
        getDates: (): [Date, Date] => {
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          return [start, end];
        },
      },
    ],
    [],
  );

  const handleQuickPreset = useCallback(
    (preset: (typeof quickDatePresets)[0]) => {
      const [start, end] = preset.getDates();
      onDateRangeChange({ from: start, to: end });
      setDateFilterOpen(false);
    },
    [onDateRangeChange, quickDatePresets],
  );

  const getActivePreset = useCallback(() => {
    if (!dateRange?.from || !dateRange?.to) return null;

    return quickDatePresets.find((preset) => {
      const [presetStart, presetEnd] = preset.getDates();
      return (
        dateRange.from?.toDateString() === presetStart.toDateString() &&
        dateRange.to?.toDateString() === presetEnd.toDateString()
      );
    });
  }, [dateRange, quickDatePresets]);

  const activePreset = getActivePreset();

  return (
    <div className={cn("group relative", className)}>
      <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "border-muted/30 hover:border-primary/40 relative rounded-full transition-all",
              (dateRange?.from ?? dateRange?.to) &&
                "border-primary/40 bg-primary/10 text-primary",
            )}
            aria-label={`Filtro data: ${getDateFilterDisplay()}`}
          >
            <RiCalendarLine
              className={cn(
                "text-muted-foreground/60 size-4",
                (dateRange?.from ?? dateRange?.to) && "text-primary",
              )}
              size={16}
              aria-hidden="true"
            />
            <span className={cn("text-sm")}>{getDateFilterDisplay()}</span>
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
                  <div className="bg-muted/20 border-muted/30 flex h-10 items-center justify-center rounded-md border px-3 text-center">
                    <span className="text-sm font-medium">
                      {dateRange?.from
                        ? format(dateRange.from, "dd MMM, yyyy", {
                            locale: it,
                          })
                        : "Data di inizio"}
                    </span>
                  </div>
                  <div className="bg-muted/20 border-muted/30 flex h-10 items-center justify-center rounded-md border px-3 text-center">
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-muted-foreground/80 mb-2 text-sm font-medium tracking-wider uppercase">
                    Filtra per
                  </p>
                  <div className="flex flex-col gap-1">
                    {availableDateFields.map((field) => (
                      <Button
                        key={field.value}
                        variant={
                          dateField === field.value ? "secondary" : "ghost"
                        }
                        size="sm"
                        onClick={() => onDateFieldChange(field.value)}
                        className="h-auto justify-start rounded-lg px-2 py-1.5 text-sm"
                      >
                        {field.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-muted-foreground/80 mb-2 text-sm font-medium tracking-wider uppercase">
                    Preset Rapidi
                  </p>
                  <div className="grid grid-cols-2 gap-2">
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
                        className="h-auto rounded-lg px-2 py-1.5 text-sm"
                      >
                        {preset.label}
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

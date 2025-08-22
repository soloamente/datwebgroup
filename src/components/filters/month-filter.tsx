"use client";

import { type FC, useMemo, useState } from "react";
import { RiCalendarLine } from "@remixicon/react";
import { Check } from "lucide-react";
import CloseIcon from "@/components/icons/close";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FaCalendar } from "react-icons/fa6";

export interface MonthFilterProps {
  selectedMonths?: number;
  onMonthsChange: (months: number | undefined) => void;
  className?: string;
  align?: "start" | "center" | "end";
}

const monthOptions = [
  { value: "1", label: "Ultimo mese" },
  { value: "3", label: "Ultimi 3 mesi" },
  { value: "6", label: "Ultimi 6 mesi" },
  { value: "12", label: "Ultimo anno" },
  { value: "24", label: "Ultimi 2 anni" },
  { value: "36", label: "Ultimi 3 anni" },
  { value: "all", label: "Totale storico" },
];

export const MonthFilter: FC<MonthFilterProps> = ({
  selectedMonths,
  onMonthsChange,
  className,
  align = "end",
}) => {
  const [monthFilterOpen, setMonthFilterOpen] = useState(false);
  const getMonthFilterDisplay = useMemo(() => {
    if (!selectedMonths) return "Totale storico";
    const option = monthOptions.find(
      (opt) => opt.value === selectedMonths.toString(),
    );
    return option?.label ?? `${selectedMonths} mesi`;
  }, [selectedMonths]);

  const handleMonthChange = (value: string) => {
    if (value === "all") {
      onMonthsChange(undefined);
    } else {
      onMonthsChange(parseInt(value, 10));
    }
    setMonthFilterOpen(false);
  };

  return (
    <div className={cn("group relative", className)}>
      <Popover open={monthFilterOpen} onOpenChange={setMonthFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "ring-border bg-card relative rounded-full border-none ring-1 transition-all",
              selectedMonths && "border-primary/40 bg-primary/10 text-primary",
            )}
            aria-label={`Filtro mesi: ${getMonthFilterDisplay}`}
          >
            <FaCalendar
              className={cn(
                "text-muted-foreground/50 mb-0.5 size-4",
                selectedMonths && "text-primary",
              )}
              size={16}
              aria-hidden="true"
            />
            <span className={cn("text-sm")}>{getMonthFilterDisplay}</span>
            {selectedMonths && (
              <div
                role="button"
                tabIndex={0}
                aria-label="Cancella filtro mesi"
                className="group/clear -mr-2 ml-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMonthsChange(undefined);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onMonthsChange(undefined);
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
          <div className="flex flex-col">
            <div className="ring-border bg-muted/20 rounded-lg border-none ring-1">
              <p className="text-muted-foreground flex justify-center p-2 text-sm font-medium uppercase">
                Filtra per periodo
              </p>
              <div className="bg-card ring-border grid grid-cols-2 gap-2 rounded-2xl p-2 ring-1">
                {monthOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      (selectedMonths?.toString() ?? "all") === option.value
                        ? "secondary"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleMonthChange(option.value)}
                    className={cn(
                      "ring-border h-auto rounded-md border-none px-3 py-2 text-sm ring-1",
                      (selectedMonths?.toString() ?? "all") === option.value &&
                        "bg-muted/20",
                    )}
                    aria-pressed={
                      (selectedMonths?.toString() ?? "all") === option.value
                    }
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {option.label}
                      {(selectedMonths?.toString() ?? "all") ===
                        option.value && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

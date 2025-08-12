"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { format, setHours, setMinutes } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (day: Date | undefined) => {
    if (!day) {
      if (onChange) {
        onChange(undefined);
      }
      return;
    }
    const newDate = setHours(
      setMinutes(day, value?.getMinutes() ?? 0),
      value?.getHours() ?? 0,
    );
    if (onChange) {
      onChange(newDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: timeValue } = e.target;
    const [hoursStr, minutesStr] = timeValue.split(":");

    const hours = parseInt(hoursStr ?? "NaN", 10);
    const minutes = parseInt(minutesStr ?? "NaN", 10);

    let newDate = value ? new Date(value) : new Date();

    if (!Number.isNaN(hours)) {
      newDate = setHours(newDate, hours);
    }

    if (!Number.isNaN(minutes)) {
      newDate = setMinutes(newDate, minutes);
    }

    if (onChange) {
      onChange(newDate);
    }
  };

  const timeValue = value ? format(value, "HH:mm") : "";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "ring-border bg-muted/10 w-full cursor-pointer justify-start text-left font-normal ring-1",
            "ring-offset-background focus-visible:ring-ring inline-flex items-center rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
            "bg-background hover:bg-accent hover:text-accent-foreground h-10 border-none px-4 py-2",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {value ? format(value, "PPP HH:mm") : <span>Pick a date</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          initialFocus
        />
        <div className="border-border border-t p-3">
          <div className="flex items-center justify-center gap-2">
            <Input
              id="time"
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="w-full"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

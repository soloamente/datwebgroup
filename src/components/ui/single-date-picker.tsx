"use client";

import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { RiCalendarLine } from "@remixicon/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SingleDatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  className?: string;
}

export function SingleDatePicker({
  value,
  onChange,
  className,
}: SingleDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <RiCalendarLine className="mr-2 h-4 w-4" />
          {value ? (
            format(value, "PPP", { locale: it })
          ) : (
            <span>Scegli una data</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border-border bg-card w-auto rounded-xl border p-0 shadow-lg">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

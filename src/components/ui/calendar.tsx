"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DropdownProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const currentYear = new Date().getFullYear();
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(className)}
      captionLayout="dropdown-buttons"
      fromYear={1980}
      toYear={currentYear + 5}
      classNames={{
        months:
          "flex flex-col items-center justify-center sm:flex-row sm:items-start sm:justify-center sm:gap-8 ",
        month: "space-y-4",
        // Reserve horizontal space so month/year dropdowns do not overlap with nav arrows
        caption:
          "relative mb-4 flex items-center justify-center pl-12 pr-16 pt-1",
        caption_label: "text-sm font-medium sr-only",
        // Keep dropdowns centered with a small gap; prevent them from expanding under arrows
        caption_dropdowns:
          "flex items-center justify-center gap-3 [&_.prose-body]:hidden",
        dropdown_month: "relative",
        dropdown_year: "relative mr-2",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-8 rounded-full bg-transparent p-0 transition-transform active:scale-95",
        ),
        // Position nav buttons inside the reserved padding area
        nav_button_previous: "absolute left-4",
        nav_button_next: "absolute right-4",
        table: "mx-auto border-collapse",
        head_row: "grid grid-cols-7",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-sm",
        row: "grid grid-cols-7 mt-2",
        cell: cn(
          "relative w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          // Keep ring visible even after focus changes by applying on aria-selected state
          "size-9 p-0 font-normal aria-selected:opacity-100 aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:outline-none aria-selected:ring-2 aria-selected:ring-primary/60 aria-selected:ring-offset-2 aria-selected:ring-offset-background",
        ),
        // Make rings persistent regardless of focus and even when only the start of range is chosen
        day_range_start:
          "day-range-start ring-2 ring-primary/60 ring-offset-2 ring-offset-background aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end ring-2 ring-primary/60 ring-offset-2 ring-offset-background aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground ring-2 ring-primary/60 ring-offset-2 ring-offset-background",
        day_today: "bg-accent text-accent-foreground ring-1 ring-border",
        day_outside:
          "day-outside text-muted-foreground/50 aria-selected:text-muted-foreground/50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Dropdown: ({
          value,
          onChange,
          children,
          name,
          ...props
        }: DropdownProps) => {
          const options = React.Children.toArray(
            children,
          ) as React.ReactElement<React.HTMLProps<HTMLOptionElement>>[];
          const selected = options.find((child) => child.props.value === value);
          const handleChange = (value: string) => {
            const event = {
              target: { value },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(event);
          };
          const triggerClassName = cn(
            "ring-border bg-card pr-1.5 ring-1  cursor-pointer",
            // Widen the year dropdown slightly to avoid crowding the right nav arrow
            name === "year"
              ? "min-w-[5.5rem] md:min-w-[6rem]"
              : "min-w-[6.25rem]",
          );
          return (
            <Select
              value={value?.toString()}
              onValueChange={(value) => {
                handleChange(value);
              }}
            >
              <SelectTrigger className={triggerClassName}>
                <SelectValue>{selected?.props?.children}</SelectValue>
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="ring-border bg-card border-none ring-1"
              >
                {options.map((option, id: number) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={id}
                    value={option.props.value?.toString() ?? ""}
                  >
                    {option.props.children}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };

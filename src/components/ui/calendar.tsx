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
        months: "flex flex-col sm:flex-row sm:gap-8 p-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-sm font-medium sr-only",
        caption_dropdowns:
          "flex justify-center items-center gap-2 [&_.prose-body]:hidden",
        dropdown_month: "relative",
        dropdown_year: "relative",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-8 rounded-full bg-transparent p-0 transition-transform active:scale-95",
        ),
        nav_button_previous: "absolute left-4",
        nav_button_next: "absolute right-4",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-sm",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground/50 aria-selected:text-muted-foreground/50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Dropdown: ({ value, onChange, children, ...props }: DropdownProps) => {
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
          return (
            <Select
              value={value?.toString()}
              onValueChange={(value) => {
                handleChange(value);
              }}
            >
              <SelectTrigger className="ring-border bg-card pr-1.5 ring-1 focus:ring-0">
                <SelectValue>{selected?.props?.children}</SelectValue>
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="ring-border bg-card ring-1"
              >
                {options.map((option, id: number) => (
                  <SelectItem
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

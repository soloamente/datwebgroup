"use client";

import { useState, useMemo, useRef, useLayoutEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RiFilter3Line, RiCloseLine } from "@remixicon/react";
import { cn } from "@/lib/utils";
import { type BatchDocumentClassField } from "@/app/api/api";
import { Checkbox } from "@/components/ui/checkbox";
import { SingleDatePicker } from "@/components/ui/single-date-picker";
import { format } from "date-fns";

type Field = BatchDocumentClassField;

interface DynamicFieldFilterProps {
  field: Field;
  value: string | string[] | undefined;
  onChange: (value: string | string[] | undefined) => void;
  className?: string;
}

export function DynamicFieldFilter({
  field,
  value,
  onChange,
  className,
}: DynamicFieldFilterProps) {
  const [open, setOpen] = useState(false);
  // Support multi-select: value is string[] for enum/boolean, string for others
  const isMultiSelect =
    field.data_type === "enum" || field.data_type === "boolean";
  const selectedValues: string[] = isMultiSelect
    ? Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : typeof value === "string" && value !== "" && value !== "all"
        ? [value]
        : []
    : [];
  const hasActiveFilter =
    (isMultiSelect && selectedValues.length > 0) ||
    (!isMultiSelect && value !== undefined && value !== "" && value !== "all");

  const handleClearClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(isMultiSelect ? [] : undefined);
  };

  const handleCheckboxChange = (checked: boolean, val: string) => {
    let newValues = [...selectedValues];
    if (checked) {
      if (!newValues.includes(val)) newValues.push(val);
    } else {
      newValues = newValues.filter((v) => v !== val);
    }
    onChange(newValues.length > 0 ? newValues : []);
  };

  const [search, setSearch] = useState("");

  const renderFilterInput = () => {
    switch (field.data_type) {
      case "boolean":
        return (
          <div className="flex flex-col gap-1">
            {[
              { value: "true", label: "Sì" },
              { value: "false", label: "No" },
              { value: "null", label: "Non specificato" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2"
              >
                <Checkbox
                  checked={selectedValues.includes(opt.value)}
                  onCheckedChange={(checked: boolean) =>
                    handleCheckboxChange(checked, opt.value)
                  }
                  className="size-4"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case "enum":
        if (Array.isArray(field.options)) {
          const showSearch = field.options.length > 7;
          const filteredOptions = showSearch
            ? field.options.filter((option) =>
                option.label.toLowerCase().includes(search.toLowerCase()),
              )
            : field.options;
          return (
            <div className="flex flex-col gap-1">
              {showSearch && (
                <Input
                  placeholder={`Cerca...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mb-2"
                />
              )}
              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                <label
                  key="null-option"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Checkbox
                    checked={selectedValues.includes("null")}
                    onCheckedChange={(checked: boolean) =>
                      handleCheckboxChange(checked, "null")
                    }
                    className="size-4"
                  />
                  <span>Non specificato</span>
                </label>
                {filteredOptions.length === 0 ? (
                  <span className="text-muted-foreground text-xs">
                    Nessuna opzione trovata
                  </span>
                ) : (
                  filteredOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Checkbox
                        checked={selectedValues.includes(option.value)}
                        onCheckedChange={(checked: boolean) =>
                          handleCheckboxChange(checked, option.value)
                        }
                        className="size-4"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          );
        }
        return null;

      case "date":
      case "datetime": {
        const dateValue =
          typeof value === "string" && value ? new Date(value) : undefined;
        return (
          <SingleDatePicker
            value={dateValue}
            onChange={(date) => {
              onChange(date ? format(date, "yyyy-MM-dd") : undefined);
              setOpen(false); // Close popover on selection
            }}
          />
        );
      }

      case "integer":
      case "decimal":
        return (
          <Input
            type="number"
            placeholder={`Filtra per ${field.label}...`}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      default: // string and others
        return (
          <Input
            placeholder={`Cerca ${field.label}...`}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  const displayValue = useMemo(() => {
    if (!hasActiveFilter) return field.label;
    if (field.data_type === "enum" && Array.isArray(field.options)) {
      const selectedLabels = selectedValues
        .map((v) => {
          if (v === "null") return "Non specificato";
          return field.options.find((o) => o.value === v)?.label;
        })
        .filter(Boolean);
      return selectedLabels.join(", ") || field.label;
    }
    if (field.data_type === "boolean") {
      const selectedLabels = selectedValues.map((v) => {
        if (v === "true") return "Sì";
        if (v === "false") return "No";
        if (v === "null") return "Non specificato";
        return "";
      });
      return selectedLabels.join(", ");
    }
    if (
      (field.data_type === "date" || field.data_type === "datetime") &&
      typeof value === "string" &&
      value
    ) {
      try {
        return format(new Date(value), "dd/MM/yyyy");
      } catch (e) {
        return value;
      }
    }
    return typeof value === "string" ? value : "";
  }, [hasActiveFilter, field, value, selectedValues]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverWidth, setPopoverWidth] = useState<number>();

  useLayoutEffect(() => {
    if (buttonRef.current) {
      setPopoverWidth(buttonRef.current.getBoundingClientRect().width);
    }
  }, [open, hasActiveFilter, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          className={cn(
            "ring-border bg-card rounded-full border-none pr-2 pl-3 ring-1",
            "flex items-center gap-1.5",
            hasActiveFilter && "bg-primary/10 text-primary",
          )}
          aria-label={`Filtra per ${field.label}`}
        >
          <RiFilter3Line className="text-muted-foreground/80 size-4" />
          <span>{field.label}</span>
          {hasActiveFilter && (
            <>
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-[20px] truncate px-1.5 text-xs"
              >
                {displayValue}
              </Badge>
              <span
                role="button"
                aria-label={`Rimuovi filtro ${field.label}`}
                onClick={handleClearClick}
                className={cn(
                  "text-muted-foreground/60 hover:text-foreground hover:bg-muted -mr-1 ml-0.5 flex h-5 w-5 items-center justify-center rounded-full",
                )}
              >
                <RiCloseLine size={14} />
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="rounded-2xl p-4"
        style={
          popoverWidth
            ? { minWidth: popoverWidth, width: "max-content", maxWidth: 350 }
            : { width: "max-content", maxWidth: 350 }
        }
      >
        <div className="space-y-2">
          <label className="text-sm font-semibold">{field.label}</label>
          {renderFilterInput()}
        </div>
      </PopoverContent>
    </Popover>
  );
}

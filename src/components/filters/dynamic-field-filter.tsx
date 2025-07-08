"use client";

import { useState, useMemo } from "react";
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
import { type DocumentClassDetails } from "@/app/api/api";

type Field = DocumentClassDetails["fields"][0];

interface DynamicFieldFilterProps {
  field: Field;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  className?: string;
}

export function DynamicFieldFilter({
  field,
  value,
  onChange,
  className,
}: DynamicFieldFilterProps) {
  const [open, setOpen] = useState(false);
  const hasActiveFilter =
    value !== undefined && value !== "" && value !== "all";

  const handleClearClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(undefined);
  };

  const renderFilterInput = () => {
    const commonProps = {
      value:
        value ??
        (field.data_type === "boolean" || field.data_type === "enum"
          ? "all"
          : ""),
      onValueChange: (val: string) => onChange(val),
    };

    if (field.data_type === "boolean") {
      return (
        <Select {...commonProps}>
          <SelectTrigger>
            <SelectValue placeholder="Tutti" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="true">Sì</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (field.data_type === "enum") {
      return (
        <Select {...commonProps}>
          <SelectTrigger>
            <SelectValue placeholder="Tutti" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        placeholder={`Cerca ${field.label}...`}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };

  const displayValue = useMemo(() => {
    if (!hasActiveFilter) return field.label;
    if (field.data_type === "enum") {
      return (
        field.options?.find((o) => o.value === value)?.label ?? field.label
      );
    }
    if (field.data_type === "boolean") {
      return value === "true" ? "Sì" : "No";
    }
    return value;
  }, [hasActiveFilter, field, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "border-muted/30 hover:border-primary/40 rounded-full pr-2 pl-3",
            "flex items-center gap-1.5",
            hasActiveFilter && "border-primary/60 bg-primary/5",
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
      <PopoverContent align="end" className="w-72 rounded-2xl p-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">{field.label}</label>
          {renderFilterInput()}
        </div>
      </PopoverContent>
    </Popover>
  );
}

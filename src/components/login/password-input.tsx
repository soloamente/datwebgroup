"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, LockIcon, InfoIcon } from "lucide-react";
import { useId, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Info from "@/components/icons/info";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  ruleset?: string[];
  showInfo?: boolean;
  infoVariant?: "bold" | "broken" | "linear" | "bulk" | "twotone" | "outline";
  infoSize?: number;
  infoColor?: string;
  infoClassName?: string;
  infoStrokeWidth?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function PasswordInput({
  value,
  onChange,
  label,
  ruleset,
  showInfo = false,
  infoVariant,
  infoSize,
  infoColor,
  infoClassName,
  infoStrokeWidth,
  onKeyDown,
}: PasswordInputProps) {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <div className="">
      <Label
        htmlFor={id}
        className="flex items-center justify-between transition-all duration-700"
      >
        <div className="text-sm">{label}</div>
        {showInfo && ruleset && ruleset.length > 0 && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Info
                  variant={infoVariant}
                  size={infoSize}
                  color={infoColor}
                  className={infoClassName}
                  strokeWidth={infoStrokeWidth}
                  aria-label="Password rules"
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="end"
                className="bg-popover text-popover-foreground rounded-md p-3 text-xs shadow-md"
              >
                <p className="mb-1 font-semibold">La password deve:</p>
                <ul className="list-disc space-y-0.5 pl-4">
                  {ruleset.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Label>
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={onChange}
          autoFocus
          className="peer border-border h-14 rounded-2xl border-[1.5px] p-4 ps-10 pe-9 placeholder:text-black/20 dark:border-white/20 dark:placeholder:text-white/20"
          placeholder="Pa12£$56789!%"
          type={isVisible ? "text" : "password"}
          onKeyDown={onKeyDown}
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <LockIcon size={16} aria-hidden="true" />
        </div>
        <button
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-all duration-700 outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          aria-controls="password"
        >
          {isVisible ? (
            <EyeOffIcon size={16} aria-hidden="true" />
          ) : (
            <EyeIcon size={16} aria-hidden="true" />
          )}
        </button>
      </div>
      <div className="flex items-center gap-2 opacity-40"></div>
    </div>
  );
}

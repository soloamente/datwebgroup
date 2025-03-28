"use client";

import { cn } from "@/lib/utils";
import { OTPInput, SlotProps } from "input-otp";
import { useId } from "react";

export default function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="w-full">
      <OTPInput
        id={id}
        value={value}
        onChange={onChange}
        containerClassName="flex w-full items-center has-disabled:opacity-50"
        maxLength={5}
        render={({ slots }) => (
          <div className="flex w-full justify-between">
            {slots.map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        )}
      />
    </div>
  );
}

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "border-input bg-background text-foreground flex size-16 items-center justify-center rounded-md border font-medium shadow-xs transition-[color,box-shadow]",
        { "border-ring ring-ring/50 z-10 ring-[3px]": props.isActive },
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.char === null && <div className="text-gray-400">_</div>}
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { useId, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export default function PasswordInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <div className="*:not-first:mt-2">
      <Label
        htmlFor={id}
        className="flex items-center justify-between transition-all duration-700"
      >
        <div className="text-sm">Password</div>{" "}
        <div className="flex items-center gap-2">
          <p className="text-sm">Ricordami </p>
          <Checkbox />
        </div>
      </Label>
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={onChange}
          className="peer h-12 rounded-2xl p-4 ps-9 pe-9 placeholder:text-black/20 lg:h-14 dark:border-white/20 dark:placeholder:text-white/20"
          placeholder="Pa12£$56789!%"
          type={isVisible ? "text" : "password"}
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

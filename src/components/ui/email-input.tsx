import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useId } from "react";

export default function EmailInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const id = useId();
  return (
    <div className="*:not-first:mt-2">
      {/* Email input with icon, styled like UsernameInput for consistency */}
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={onChange}
          placeholder="esempio@gmail.com"
          type="email"
          className="peer border-border h-14 rounded-2xl border-[1.5px] ps-10 placeholder:text-black/30 dark:border-white/20 dark:placeholder:text-white/20"
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <Mail size={20} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

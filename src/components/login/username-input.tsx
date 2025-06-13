import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSignIcon, User } from "lucide-react";
import { useId } from "react";

export default function UsernameInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const id = useId();
  return (
    <div className="*:not-first:mt-2">
      <div className="relative">
        <Input
          id={id}
          placeholder="johndoe"
          type="username"
          value={value}
          onChange={onChange}
          className="peer h-14 rounded-2xl ps-10 placeholder:text-black/20 dark:border-white/20 dark:placeholder:text-white/20"
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <User size={20} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

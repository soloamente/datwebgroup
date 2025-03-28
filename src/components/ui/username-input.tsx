import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <Label htmlFor={id} className="transition-all duration-700">
        Username
      </Label>
      <Input
        id={id}
        placeholder="Il tuo username"
        type="username"
        value={value}
        onChange={onChange}
        className="h-12 rounded-lg placeholder:text-black/20 dark:border-white/20 dark:placeholder:text-white/20"
      />
    </div>
  );
}

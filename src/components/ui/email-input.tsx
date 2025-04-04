import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <Label htmlFor={id} className="transition-all duration-700">
        Email
      </Label>
      <Input
        id={id}
        value={value}
        onChange={onChange}
        placeholder="esempio@gmail.com"
        type="email"
        className="h-12 rounded-lg placeholder:text-black/20 dark:border-white/20 dark:placeholder:text-white/20"
      />
    </div>
  );
}

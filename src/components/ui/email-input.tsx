import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId } from "react";

export default function EmailInput() {
  const id = useId();
  return (
    <div className="transition-all duration-700 *:not-first:mt-2">
      <Label htmlFor={id} className="transition-all duration-700">
        Email
      </Label>
      <Input
        id={id}
        placeholder="esempio@gmail.com "
        type="email"
        className="h-12 rounded-lg placeholder:text-black/20 dark:border-white/20 dark:placeholder:text-white/20"
      />
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

const stackVariants = cva("flex", {
  variants: {
    direction: {
      row: "flex",
      column: "flex-col",
      grid: "",
    },
    align: {
      center: "items-center",
      start: "items-start",
      end: "items-end",
    },
    justify: {
      center: "justify-center",
      start: "justify-start",
      end: "justify-end",
    },
  },
  defaultVariants: {
    direction: "column",
    align: "center",
    justify: "center",
  },
});

export function Stack({
  className,
  direction,
  align,
  justify,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof stackVariants> & {
    asChild?: boolean;
    gap?: number;
    columns?: number;
  }) {
  const Comp = asChild ? Slot : "div";
  const gap = props.gap;
  const columns = props.columns;
  return (
    <Comp
      className={cn(
        stackVariants({ direction, align, justify }),
        className,
        gap && `gap-${gap}`,
        direction === "grid" && columns && `grid-cols-${columns}`,
      )}
      {...props}
    />
  );
}

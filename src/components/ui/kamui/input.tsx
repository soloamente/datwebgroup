"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  [
    "relative w-full transition-all duration-200 ease-out",
    "bg-input border-border border",
    "text-foreground placeholder:text-muted-foreground/60",
    "focus-visible:outline-none  focus-within:border-primary",
    "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/30",
    "motion-reduce:transition-none",
    "font-normal tracking-normal",
    "flex items-center",
  ],
  {
    variants: {
      size: {
        xs: "h-7 min-h-7 text-xs px-2.5 gap-1.5",
        sm: "h-8 min-h-8 text-sm px-3 gap-2",
        default: "h-10 min-h-10 text-sm px-3.5 gap-2.5",
        lg: "h-11 min-h-11 text-base px-4 gap-3",
        xl: "h-12 min-h-12 text-lg px-4.5 gap-3.5",
      },
      radius: {
        none: "rounded-none",
        xs: "rounded-xs",
        sm: "rounded-sm",
        default: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      size: "default",
      radius: "default",
    },
  },
);

const inputFieldVariants = cva(
  [
    "flex-1 bg-transparent border-none outline-none",
    "placeholder:text-inherit placeholder:opacity-60",
    "disabled:cursor-not-allowed",
    "appearance-none",
  ],
  {
    variants: {
      size: {
        xs: "text-xs",
        sm: "text-sm",
        default: "text-sm",
        lg: "text-base",
        xl: "text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const contentVariants = cva(
  [
    "flex items-center justify-center shrink-0",
    "text-muted-foreground/70 transition-colors duration-200",
    "[&>svg]:shrink-0",
  ],
  {
    variants: {
      size: {
        xs: "text-xs [&>svg]:size-3",
        sm: "text-sm [&>svg]:size-3.5",
        default: "text-sm [&>svg]:size-4",
        lg: "text-base [&>svg]:size-4",
        xl: "text-base [&>svg]:size-5",
      },
      position: {
        start: "",
        end: "",
      },
    },
    defaultVariants: {
      size: "default",
      position: "start",
    },
  },
);

interface InputProps
  extends Omit<React.ComponentPropsWithRef<"input">, "size">,
    VariantProps<typeof inputVariants> {
  /**
   * Element to be rendered at the start of the input.
   */
  startContent?: React.ReactNode;

  /**
   * Element to be rendered at the end of the input.
   */
  endContent?: React.ReactNode;

  /**
   * Additional classes for the wrapper container.
   */
  wrapperClassName?: string;

  /**
   * Additional classes for the input field itself.
   */
  inputClassName?: string;

  /**
   * Whether the input has an error state.
   */
  error?: boolean;

  /**
   * Loading state for the input.
   */
  loading?: boolean;

  /**
   * Whether the input is read-only.
   */
  isReadOnly?: boolean;
}

function Input({
  className,
  wrapperClassName,
  inputClassName,
  size,
  radius,
  startContent,
  endContent,
  error,
  loading,
  disabled,
  isReadOnly,
  ref,
  ...props
}: InputProps) {
  return (
    <div className={cn("relative w-full max-w-sm", wrapperClassName)}>
      <div
        className={cn(
          inputVariants({ size, radius, className }),
          error && [
            "border-destructive/60 focus-within:border-destructive",
            "focus-within:ring-destructive/20",
          ],
          loading && "cursor-wait",
          isReadOnly && [
            "bg-muted/50 border-muted-foreground/20",
            "focus-within:ring-muted-foreground/20 focus-within:border-muted-foreground/40",
          ],
          (disabled ?? loading) && "pointer-events-none",
        )}
      >
        {startContent && (
          <div className={cn(contentVariants({ size, position: "start" }))}>
            {startContent}
          </div>
        )}

        <input
          ref={ref}
          disabled={disabled ?? loading}
          readOnly={isReadOnly}
          className={cn(
            inputFieldVariants({ size }),
            isReadOnly && "cursor-default select-all",
            inputClassName,
          )}
          {...props}
        />

        {loading && (
          <div className={cn(contentVariants({ size, position: "end" }))}>
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}

        {!loading && endContent && (
          <div className={cn(contentVariants({ size, position: "end" }))}>
            {endContent}
          </div>
        )}
      </div>
    </div>
  );
}

Input.displayName = "Input";

export { Input, inputVariants, type InputProps };

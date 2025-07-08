"use client";

import {
  Button as ButtonPrimitive,
  type PressEvent,
  type ButtonProps as ButtonPrimitiveProps,
} from "react-aria-components";
import { type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button.styles";
import { useRipple } from "@/hooks/use-ripple";

interface ButtonProps
  extends ButtonPrimitiveProps,
    VariantProps<typeof buttonVariants> {
  pending?: boolean;
  disableRipple?: boolean;
}

function Button({
  className,
  children,
  variant = "solid",
  size = "md",
  color = "default",
  radius = "md",
  disableAnimation = false,
  isIconOnly = false,
  pending = false,
  disableRipple = false,
  ...props
}: ButtonProps) {
  const {
    onPress: onRipplePressHandler,
    onClear: onClearRipple,
    ripples,
  } = useRipple();

  const handlePress = (e: PressEvent) => {
    if (!disableRipple) {
      onRipplePressHandler(e);
    }
    if (props.onPress) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      props.onPress(e);
    }
  };

  return (
    <ButtonPrimitive
      isPending={pending}
      data-size={size}
      className={cn(
        buttonVariants({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          className,
          variant,
          size,
          color,
          radius,
          disableAnimation,
          isIconOnly,
        }),
        pending &&
          "data-[size=lg]:pl-13 data-[size=md]:pl-9.5 data-[size=sm]:pl-8",
        !disableRipple && "relative overflow-hidden",
      )}
      {...props}
      onPress={handlePress}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      style={{
        ...props.style,
        transitionTimingFunction: `linear(0, 0.0016 0.55%, 0.0077 1.23%, 0.0291 2.46%, 0.0657, 0.1129 5.19%, 0.2219 7.78%, 0.4795 13.25%, 0.5893 15.71%, 0.6988 18.44%, 0.788, 0.862, 0.9209 26.22%, 0.9463, 0.9681, 0.9866 30.32%, 1.0033 31.82%, 1.0227 34.14%, 1.0359 36.6%, 1.0437 39.33%, 1.046 42.34%, 1.0445 44.8%, 1.0405 47.53%, 1.012 61.73%, 1.0027 69.51%, 0.9981 80.44%, 0.9991 99.97%)`,
        transitionDuration: "0.8000s",
      }}
    >
      {(values) => {
        return (
          <>
            {/* Ripple Effects */}
            {!disableRipple && (
              <div className="pointer-events-none absolute inset-0">
                {ripples.map((ripple) => (
                  <span
                    key={ripple.key}
                    className="animate-ripple absolute rounded-full bg-current opacity-30"
                    style={{
                      left: ripple.x,
                      top: ripple.y,
                      width: ripple.size,
                      height: ripple.size,
                      animationDuration: "600ms",
                    }}
                    onAnimationEnd={() => onClearRipple(ripple.key)}
                  />
                ))}
              </div>
            )}

            <div
              className={cn(
                "absolute top-1/2 left-4 -translate-y-1/2 scale-40 opacity-0",
                pending &&
                  "scale-100 opacity-100 group-data-[size=lg]:-translate-x-0 group-data-[size=md]:-translate-x-[4px]",
              )}
              style={{
                transitionTimingFunction: `linear(0, 0.0016 0.55%, 0.0077 1.23%, 0.0291 2.46%, 0.0657, 0.1129 5.19%, 0.2219 7.78%, 0.4795 13.25%, 0.5893 15.71%, 0.6988 18.44%, 0.788, 0.862, 0.9209 26.22%, 0.9463, 0.9681, 0.9866 30.32%, 1.0033 31.82%, 1.0227 34.14%, 1.0359 36.6%, 1.0437 39.33%, 1.046 42.34%, 1.0445 44.8%, 1.0405 47.53%, 1.012 61.73%, 1.0027 69.51%, 0.9981 80.44%, 0.9991 99.97%)`,
                transitionDuration: "0.8000s",
              }}
            >
              <Loader2 className="animate-spin group-data-[size=lg]:size-6 group-data-[size=md]:size-5" />
            </div>

            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
            {typeof children === "function" ? children(values) : children}
          </>
        );
      }}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };

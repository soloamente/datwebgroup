import { cva } from "class-variance-authority";

const buttonVariants = cva(
  [
    "group z-0 relative inline-flex items-center justify-center appearance-none select-none whitespace-nowrap min-w-max font-medium subpixel-antialiased transform-gpu",
    "data-[pressed=true]:scale-97 cursor-pointer",
    "data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "transition-all duration-100",
  ],
  {
    variants: {
      variant: {
        solid: "",
        bordered: "border-2 bg-transparent",
        light: "bg-transparent",
        flat: "",
        shadow: "",
        ghost: "border-2 bg-transparent",
        swiss: "",
      },
      size: {
        sm: "px-3 min-w-16 h-8 text-sm gap-2 rounded-small",
        md: "px-4 min-w-20 h-10 text-base gap-2 rounded-medium",
        lg: "px-6 min-w-24 h-12 text-lg gap-3 rounded-large",
      },
      color: {
        default: "data-[focus-visible=true]:outline-default",
        primary: "data-[focus-visible=true]:outline-primary",
        secondary: "data-[focus-visible=true]:outline-secondary",
        success: "data-[focus-visible=true]:outline-success",
        warning: "data-[focus-visible=true]:outline-warning",
        danger: "data-[focus-visible=true]:outline-destructive",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-lg",
        md: "rounded-xl",
        lg: "rounded-2xl",
        full: "rounded-full",
      },
      isIconOnly: {
        true: "px-0 !gap-0",
        false: "[&>svg]:max-w-[theme(spacing.8)]",
      },
      disableAnimation: {
        true: "!transition-none data-[pressed=true]:scale-100",
        false:
          "transition-transform-colors-opacity motion-reduce:transition-none",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
      color: "default",
      radius: "md",
      disableAnimation: false,
      isIconOnly: false,
    },
    compoundVariants: [
      // solid / variant
      {
        variant: "solid",
        color: "default",
        class:
          "bg-default text-default-foreground bg-gradient-to-t from-default/90 to-default",
      },
      // solid / color
      {
        variant: "solid",
        color: "primary",
        class:
          "bg-primary text-primary-foreground bg-gradient-to-t from-primary/90 to-primary !text-white",
      },
      {
        variant: "solid",
        color: "secondary",
        class:
          "bg-secondary text-secondary-foreground bg-gradient-to-t from-secondary/90 to-secondary",
      },
      {
        variant: "solid",
        color: "success",
        class:
          "bg-success text-success-foreground bg-gradient-to-t from-success/90 to-success",
      },
      {
        variant: "solid",
        color: "warning",
        class:
          "bg-warning text-warning-foreground bg-gradient-to-t from-warning/90 to-warning",
      },
      {
        variant: "solid",
        color: "danger",
        class:
          "bg-destructive text-white bg-gradient-to-t from-destructive/90 to-destructive",
      },

      // shadow / color
      {
        variant: "shadow",
        color: "default",
        class:
          "shadow-lg shadow-default/50 bg-default text-default-foreground bg-gradient-to-t from-default/90 to-default",
      },
      {
        variant: "shadow",
        color: "primary",
        class:
          "shadow-lg shadow-primary/40 bg-primary text-primary-foreground bg-gradient-to-t from-primary/90 to-primary",
      },
      {
        variant: "shadow",
        color: "secondary",
        class:
          "shadow-lg shadow-secondary/40 bg-secondary text-secondary-foreground bg-gradient-to-t from-secondary/90 to-secondary",
      },
      {
        variant: "shadow",
        color: "success",
        class:
          "shadow-lg shadow-success/40 bg-success text-success-foreground bg-gradient-to-t from-success/90 to-success",
      },
      {
        variant: "shadow",
        color: "warning",
        class:
          "shadow-lg shadow-warning/40 bg-warning text-warning-foreground bg-gradient-to-t from-warning/90 to-warning",
      },
      {
        variant: "shadow",
        color: "danger",
        class:
          "shadow-lg shadow-destructive/40 bg-destructive text-white bg-gradient-to-t from-destructive/90 to-destructive",
      },

      // bordered / color
      {
        variant: "bordered",
        color: "default",
        class: "bg-transparent border-default text-default",
      },
      {
        variant: "bordered",
        color: "primary",
        class: "bg-transparent border-primary text-primary",
      },
      {
        variant: "bordered",
        color: "secondary",
        class: "bg-transparent border-secondary text-secondary",
      },
      {
        variant: "bordered",
        color: "success",
        class: "bg-transparent border-success text-success",
      },
      {
        variant: "bordered",
        color: "warning",
        class: "bg-transparent border-warning text-warning",
      },
      {
        variant: "bordered",
        color: "danger",
        class: "bg-transparent border-destructive text-destructive",
      },

      // flat / color
      {
        variant: "flat",
        color: "default",
        class: "bg-default/40 text-default-foreground",
      },
      {
        variant: "flat",
        color: "primary",
        class: "bg-primary/20 text-primary",
      },
      {
        variant: "flat",
        color: "secondary",
        class: "bg-secondary/40 text-secondary-foreground",
      },
      {
        variant: "flat",
        color: "success",
        class: "bg-success/20 text-success",
      },
      {
        variant: "flat",
        color: "warning",
        class: "bg-warning/20 text-warning",
      },
      {
        variant: "flat",
        color: "danger",
        class: "bg-destructive/20 text-destructive",
      },

      // light / color
      {
        variant: "light",
        color: "default",
        class:
          "bg-transparent text-default-foreground data-[hovered=true]:bg-default/40",
      },
      {
        variant: "light",
        color: "primary",
        class: "bg-transparent text-primary data-[hovered=true]:bg-primary/20",
      },
      {
        variant: "light",
        color: "secondary",
        class:
          "bg-transparent text-secondary-foreground data-[hovered=true]:bg-secondary/40",
      },
      {
        variant: "light",
        color: "success",
        class: "bg-transparent text-success data-[hovered=true]:bg-success/20",
      },
      {
        variant: "light",
        color: "warning",
        class: "bg-transparent text-warning data-[hovered=true]:bg-warning/20",
      },
      {
        variant: "light",
        color: "danger",
        class:
          "bg-transparent text-destructive data-[hovered=true]:bg-destructive/20",
      },

      // ghost / color
      {
        variant: "ghost",
        color: "default",
        class:
          "border-default text-default-foreground data-[hovered=true]:!bg-default",
      },
      {
        variant: "ghost",
        color: "primary",
        class:
          "border-primary text-primary data-[hovered=true]:!text-primary-foreground data-[hovered=true]:!bg-primary",
      },
      {
        variant: "ghost",
        color: "secondary",
        class:
          "border-secondary text-secondary-foreground data-[hovered=true]:!text-secondary-foreground data-[hovered=true]:!bg-secondary",
      },
      {
        variant: "ghost",
        color: "success",
        class:
          "border-success text-success data-[hovered=true]:!text-success-foreground data-[hovered=true]:!bg-success",
      },
      {
        variant: "ghost",
        color: "warning",
        class:
          "border-warning text-warning data-[hovered=true]:!text-warning-foreground data-[hovered=true]:!bg-warning",
      },
      {
        variant: "ghost",
        color: "danger",
        class:
          "border-destructive text-destructive data-[hovered=true]:!text-white data-[hovered=true]:!bg-destructive",
      },

      // swiss / color
      {
        variant: "swiss",
        color: "default",
        class: [
          "bg-gradient-to-b text-default-foreground overflow-hidden",
          "from-[#fefefe] via-[#f8f8f8] to-[#eeeeee] shadow-[inset_0_-1px_2px_0_rgba(0,0,0,0.08),inset_0_1px_1px_0_rgba(255,255,255,0.95),inset_0_0_0_1px_rgba(255,255,255,0.7)] drop-shadow-[0px_1px_3px_0_rgba(0,0,0,0.12),0px_4px_8px_-2px_rgba(0,0,0,0.08)]",
          "dark:from-[#2d2d2d] dark:via-[#262626] dark:to-[#1f1f1f] dark:shadow-[inset_0_-1px_2px_0_rgba(0,0,0,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(255,255,255,0.08)] dark:drop-shadow-[0px_1px_3px_0_rgba(0,0,0,0.5),0px_4px_8px_-2px_rgba(0,0,0,0.3)]",
        ],
      },
      {
        variant: "swiss",
        color: "primary",
        class:
          "bg-primary !text-primary-foreground shadow-lg shadow-primary/40",
      },
      {
        variant: "swiss",
        color: "secondary",
        class: [
          "bg-gradient-to-b text-secondary-foreground overflow-hidden",
          "from-[#fafafa] via-[#f1f1f1] to-[#e5e5e5] shadow-[inset_0_-1px_2px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.9),inset_0_0_0_1px_rgba(255,255,255,0.6)] drop-shadow-[0px_1px_3px_0_rgba(0,0,0,0.1),0px_4px_8px_-2px_rgba(0,0,0,0.06)]",
          "dark:from-[#202020] dark:via-[#181818] dark:to-[#121212] dark:shadow-[inset_0_-1px_2px_0_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.06)] dark:drop-shadow-[0px_1px_3px_0_rgba(0,0,0,0.6),0px_4px_8px_-2px_rgba(0,0,0,0.4)]",
        ],
      },
      {
        variant: "swiss",
        color: "success",
        class: [
          "bg-gradient-to-b text-success-foreground overflow-hidden",
          "from-[#22d55f] via-[#1cc653] to-[#16a34a] shadow-[inset_0_-1px_2px_0_rgba(21,128,61,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.4),inset_0_0_0_1px_rgba(255,255,255,0.25)] drop-shadow-[0px_1px_3px_0_rgba(21,128,61,0.3),0px_4px_8px_-2px_rgba(21,128,61,0.2)]",
          "dark:from-[#22d55f] dark:via-[#1cc653] dark:to-[#16a34a] dark:shadow-[inset_0_-1px_2px_0_rgba(21,128,61,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.3),inset_0_0_0_1px_rgba(255,255,255,0.2)] dark:drop-shadow-[0px_1px_3px_0_rgba(21,128,61,0.5),0px_4px_8px_-2px_rgba(21,128,61,0.3)]",
        ],
      },
      {
        variant: "swiss",
        color: "warning",
        class: [
          "bg-gradient-to-b text-warning-foreground overflow-hidden",
          "from-[#fbbf24] via-[#f59e0b] to-[#d97706] shadow-[inset_0_-1px_2px_0_rgba(180,83,9,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.4),inset_0_0_0_1px_rgba(255,255,255,0.25)] drop-shadow-[0px_1px_3px_0_rgba(180,83,9,0.3),0px_4px_8px_-2px_rgba(180,83,9,0.2)]",
          "dark:from-[#fbbf24] dark:via-[#f59e0b] dark:to-[#d97706] dark:shadow-[inset_0_-1px_2px_0_rgba(180,83,9,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.3),inset_0_0_0_1px_rgba(255,255,255,0.2)] dark:drop-shadow-[0px_1px_3px_0_rgba(180,83,9,0.5),0px_4px_8px_-2px_rgba(180,83,9,0.3)]",
        ],
      },
      {
        variant: "swiss",
        color: "danger",
        class: [
          "bg-gradient-to-b text-white overflow-hidden",
          "from-[#f87171] via-[#ef4444] to-[#dc2626] shadow-[inset_0_-1px_2px_0_rgba(153,27,27,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.3),inset_0_0_0_1px_rgba(255,255,255,0.2)] drop-shadow-[0px_1px_3px_0_rgba(153,27,27,0.4),0px_4px_8px_-2px_rgba(153,27,27,0.25)]",
          "dark:from-[#f87171] dark:via-[#ef4444] dark:to-[#dc2626] dark:shadow-[inset_0_-1px_2px_0_rgba(153,27,27,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.25),inset_0_0_0_1px_rgba(255,255,255,0.15)] dark:drop-shadow-[0px_1px_3px_0_rgba(153,27,27,0.6),0px_4px_8px_-2px_rgba(153,27,27,0.4)]",
        ],
      },

      // isIconOnly
      {
        isIconOnly: true,
        size: "sm",
        class: "min-w-8 w-8 h-8",
      },
      {
        isIconOnly: true,
        size: "md",
        class: "min-w-10 w-10 h-10",
      },
      {
        isIconOnly: true,
        size: "lg",
        class: "min-w-12 w-12 h-12",
      },
    ],
  },
);

export { buttonVariants };

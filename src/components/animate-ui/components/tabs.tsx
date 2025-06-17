"use client";

import * as React from "react";
import { motion, type Transition, type HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils";
import {
  MotionHighlight,
  MotionHighlightItem,
} from "@/components/animate-ui/effects/motion-highlight";

type TabsContextType<T extends string> = {
  activeValue: T;
  handleValueChange: (value: T) => void;
  registerTrigger: (value: T, node: HTMLElement | null) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TabsContext = React.createContext<TabsContextType<any> | undefined>(
  undefined,
);

function useTabs<T extends string = string>(): TabsContextType<T> {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider");
  }
  return context;
}

type BaseTabsProps = React.ComponentProps<"div"> & {
  children: React.ReactNode;
};

type UnControlledTabsProps<T extends string = string> = BaseTabsProps & {
  defaultValue?: T;
  value?: never;
  onValueChange?: never;
};

type ControlledTabsProps<T extends string = string> = BaseTabsProps & {
  value: T;
  onValueChange?: (value: T) => void;
  defaultValue?: never;
};

type TabsProps<T extends string = string> =
  | UnControlledTabsProps<T>
  | ControlledTabsProps<T>;

function Tabs<T extends string = string>({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  ...props
}: TabsProps<T>) {
  const [activeValue, setActiveValue] = React.useState<T | undefined>(
    defaultValue ?? undefined,
  );
  const triggersRef = React.useRef(new Map<string, HTMLElement>());
  const initialSet = React.useRef(false);
  const isControlled = value !== undefined;

  React.useEffect(() => {
    if (
      !isControlled &&
      activeValue === undefined &&
      triggersRef.current.size > 0 &&
      !initialSet.current
    ) {
      const firstTab = Array.from(triggersRef.current.keys())[0];
      setActiveValue(firstTab as T);
      initialSet.current = true;
    }
  }, [activeValue, isControlled]);

  const registerTrigger = (value: string, node: HTMLElement | null) => {
    if (node) {
      triggersRef.current.set(value, node);
      if (!isControlled && activeValue === undefined && !initialSet.current) {
        setActiveValue(value as T);
        initialSet.current = true;
      }
    } else {
      triggersRef.current.delete(value);
    }
  };

  const handleValueChange = (val: T) => {
    if (!isControlled) setActiveValue(val);
    else onValueChange?.(val);
  };

  return (
    <TabsContext.Provider
      value={{
        activeValue: (value ?? activeValue)!,
        handleValueChange,
        registerTrigger,
      }}
    >
      <div
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

type TabsListProps = React.ComponentProps<"div"> & {
  children: React.ReactNode;
  activeClassName?: string;
  transition?: Transition;
};

function TabsList({
  children,
  className,
  activeClassName,
  transition = {
    type: "spring",
    stiffness: 200,
    damping: 25,
  },
  ...props
}: TabsListProps) {
  const { activeValue } = useTabs();

  return (
    <MotionHighlight
      controlledItems
      className={cn("bg-background rounded-full shadow-sm", activeClassName)}
      value={activeValue}
      transition={transition}
    >
      <div
        role="tablist"
        data-slot="tabs-list"
        className={cn(
          "bg-muted text-muted-foreground inline-flex h-10 w-fit items-center justify-center rounded-full p-[4px]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </MotionHighlight>
  );
}

type TabsTriggerProps = Omit<HTMLMotionProps<"button">, "ref"> & {
  value: string;
  children: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
};

function TabsTrigger({
  ref,
  value,
  children,
  className,
  ...props
}: TabsTriggerProps) {
  const { activeValue, handleValueChange, registerTrigger } = useTabs();

  const localRef = React.useRef<HTMLButtonElement | null>(null);

  React.useImperativeHandle(ref, () => localRef.current!);

  React.useEffect(() => {
    registerTrigger(value, localRef.current);
    return () => registerTrigger(value, null);
  }, [value, registerTrigger]);

  return (
    <MotionHighlightItem value={value} className="size-full">
      <motion.button
        ref={localRef}
        data-slot="tabs-trigger"
        role="tab"
        whileTap={{ scale: 0.95 }}
        onClick={() => handleValueChange(value)}
        data-state={activeValue === value ? "active" : "inactive"}
        className={cn(
          "ring-offset-background focus-visible:ring-ring data-[state=active]:text-foreground z-[1] inline-flex size-full cursor-pointer items-center justify-center rounded-sm px-2 py-1 text-sm font-medium whitespace-nowrap transition-transform focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    </MotionHighlightItem>
  );
}

type TabsContentsProps = React.ComponentProps<"div"> & {
  children: React.ReactNode;
  transition?: Transition;
};

function TabsContents({
  children,
  className,
  transition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    bounce: 0,
    restDelta: 0.01,
  },
  ...props
}: TabsContentsProps) {
  const { activeValue } = useTabs();
  const childrenArray = React.Children.toArray(children);
  const activeIndex = childrenArray.findIndex(
    (child): child is React.ReactElement<{ value: string }> => {
      if (!React.isValidElement(child)) return false;
      if (typeof child.props !== "object" || child.props === null) return false;
      if (!("value" in child.props)) return false;
      const props = child.props as { value: unknown };
      return typeof props.value === "string" && props.value === activeValue;
    },
  );

  return (
    <div
      data-slot="tabs-contents"
      className={cn("overflow-hidden", className)}
      {...props}
    >
      <motion.div
        className="-mx-2 flex"
        animate={{ x: activeIndex * -100 + "%" }}
        transition={transition}
      >
        {childrenArray.map((child, index) => (
          <div key={index} className="w-full shrink-0 px-2">
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

type TabsContentProps = HTMLMotionProps<"div"> & {
  value: string;
  children: React.ReactNode;
};

function TabsContent({
  children,
  value,
  className,
  ...props
}: TabsContentProps) {
  const { activeValue } = useTabs();
  const isActive = activeValue === value;
  return (
    <motion.div
      role="tabpanel"
      data-slot="tabs-content"
      className={cn("overflow-hidden", className)}
      initial={{ filter: "blur(0px)" }}
      animate={{ filter: isActive ? "blur(0px)" : "blur(4px)" }}
      exit={{ filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
  useTabs,
  type TabsContextType,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentsProps,
  type TabsContentProps,
};

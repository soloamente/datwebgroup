"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group rounded-full"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-neutral-900 group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-neutral-700 group-[.toaster]:shadow-2xl rounded-full px-4 py-2 flex items-center gap-2 min-h-0 h-auto text-base font-medium",
          description: "group-[.toast]:text-neutral-300",
          actionButton:
            "group-[.toast]:bg-neutral-800 group-[.toast]:text-white font-medium px-3 py-1 rounded-full hover:bg-neutral-700 transition",
          cancelButton:
            "group-[.toast]:bg-neutral-700 group-[.toast]:text-neutral-300 font-medium px-3 py-1 rounded-full hover:bg-neutral-600 transition",
          closeButton:
            "group-[.toast]:text-neutral-400 hover:text-white transition",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

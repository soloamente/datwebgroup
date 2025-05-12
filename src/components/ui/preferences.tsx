"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckIcon, MinusIcon } from "lucide-react";
import { useId } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { motion } from "motion/react";

export function Preferences() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const items = [
    {
      value: "1",
      label: "DataWeb Light",
      image: "/ui-light_dataweb.png",
      onclick: () => {
        setTheme("light");
      },
      selected: mounted && theme === "light",
    },
    {
      value: "2",
      label: "DataWeb Dark",
      image: "/ui-dark_dataweb.png",
      onclick: () => {
        setTheme("dark");
      },
      selected: mounted && theme === "dark",
    },
  ];

  const id = useId();

  return (
    <motion.div className="absolute right-5 bottom-5 z-10 cursor-pointer">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl lg:h-12 lg:w-12"
          >
            <Sun className="absolute scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Cambia tema</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="flex flex-col gap-5 p-4">
          <div>
            <h1 className="font-medium">Aspetto</h1>
            <p className="text-[12px] opacity-40">
              Personalizza le tue preferenze per il sito web
            </p>
          </div>
          <Separator />
          <div>
            <h1 className="text-sm">Interfaccia</h1>
            <p className="text-[12px] opacity-40">
              Personalizza il tema della tua interfaccia
            </p>
          </div>
          <RadioGroup className="flex flex-wrap justify-start gap-12">
            {items.map((item) => (
              <label key={`${id}-${item.value}`}>
                <RadioGroupItem
                  id={`${id}-${item.value}`}
                  value={item.value}
                  className="peer sr-only after:absolute after:inset-0"
                  onClick={item.onclick}
                />

                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.label}
                  width={100}
                  height={70}
                  className="border-input peer-focus-visible:ring-ring/50 peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent relative cursor-pointer overflow-hidden rounded-md border shadow-2xs outline-hidden transition-[color,box-shadow] peer-focus-visible:ring-[3px] peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-50"
                />

                <span className="group mt-2 flex items-center gap-1">
                  <CheckIcon
                    size={16}
                    className={`${item.selected ? "block" : "hidden"}`}
                    aria-hidden="true"
                  />

                  <MinusIcon
                    size={16}
                    className={`${!item.selected ? "block" : "hidden"}`}
                    aria-hidden="true"
                  />

                  <span className="text-xs font-medium">{item.label}</span>
                </span>
              </label>
            ))}
          </RadioGroup>
          {/*  Accent Color Options 
          <Separator />
          <div className="flex flex-row items-center gap-2">
            <div>
              <h1 className="text-sm">Accent color</h1>
              <p className="text-[12px] opacity-40">
                Pick your interface main color
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  className={`h-4 w-4 rounded-full ${selectedColor === color.value ? "ring-2 ring-gray-400 ring-offset-2" : ""} `}
                  style={{ backgroundColor: color.color }}
                  aria-label={`Select ${color.label} accent color`}
                />
              ))}
            </div>
          </div>
          */}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

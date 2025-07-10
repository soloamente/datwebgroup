"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol
        role="list"
        className="divide-border flex divide-y rounded-md border md:divide-y-0"
      >
        {steps.map((step, stepIdx) => (
          <li key={step} className="relative flex flex-1">
            <div
              className={cn(
                "group flex w-full items-center",
                stepIdx < currentStep ? "cursor-pointer" : "",
              )}
            >
              <span className="flex items-center px-6 py-4 text-sm font-medium">
                {stepIdx < currentStep ? (
                  <span className="bg-primary group-hover:bg-primary-focus flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                    <Check className="h-6 w-6 text-white" aria-hidden="true" />
                  </span>
                ) : stepIdx === currentStep ? (
                  <span className="border-primary text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2">
                    <span className="">{`0${stepIdx + 1}`}</span>
                  </span>
                ) : (
                  <span className="border-muted-foreground/30 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2">
                    <span className="text-muted-foreground/50">{`0${
                      stepIdx + 1
                    }`}</span>
                  </span>
                )}
                <span className="ml-4 hidden text-sm font-medium md:block">
                  <span
                    className={cn(
                      "text-lg",
                      stepIdx < currentStep
                        ? "text-foreground"
                        : stepIdx === currentStep
                          ? "text-primary"
                          : "text-muted-foreground/50",
                    )}
                  >
                    {`Passo 0${stepIdx + 1}`}
                  </span>
                  <span
                    className={cn(
                      "block",
                      stepIdx < currentStep
                        ? "text-muted-foreground"
                        : stepIdx === currentStep
                          ? "text-foreground"
                          : "text-muted-foreground/50",
                    )}
                  >
                    {step}
                  </span>
                </span>
              </span>
            </div>

            {/* Arrow separator for md screens and up */}
            {stepIdx !== steps.length - 1 ? (
              <div
                className="absolute top-0 right-0 hidden h-full w-5 md:block"
                aria-hidden="true"
              >
                <svg
                  className="h-full w-full text-gray-300"
                  viewBox="0 0 22 80"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 -2L20 40L0 82"
                    vectorEffect="non-scaling-stroke"
                    stroke="currentcolor"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

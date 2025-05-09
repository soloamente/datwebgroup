import React from "react";
import { cn } from "@/lib/utils";

interface UserIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const UserIcon = ({ size = 24, className, ...props }: UserIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("", className)}
      {...props}
    >
      <path
        d="M12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2Z"
        fill="currentcolor"
      />
      <path
        d="M8 14C5.23858 14 3 16.2386 3 19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19C21 16.2386 18.7614 14 16 14H8Z"
        fill="currentcolor"
      />
    </svg>
  );
};

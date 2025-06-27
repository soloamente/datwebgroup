import { type SVGProps } from "react";

interface FilterVerticalProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const FilterVertical = ({
  size = 16,
  ...props
}: FilterVerticalProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 6h18" />
    <path d="M7 12h10" />
    <path d="M10 18h4" />
  </svg>
);

import { type SVGProps } from "react";

interface CalendarDateIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export const CalendarDateIcon = ({
  size = 24,
  color = "#000000",
  ...props
}: CalendarDateIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_4418_5096)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 1.25C8.41421 1.25 8.75 1.58579 8.75 2V5C8.75 5.41421 8.41421 5.75 8 5.75C7.58579 5.75 7.25 5.41421 7.25 5V2C7.25 1.58579 7.58579 1.25 8 1.25Z"
          fill={color}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 1.25C16.4142 1.25 16.75 1.58579 16.75 2V5C16.75 5.41421 16.4142 5.75 16 5.75C15.5858 5.75 15.25 5.41421 15.25 5V2C15.25 1.58579 15.5858 1.25 16 1.25Z"
          fill={color}
        />
        <path
          opacity="0.4"
          d="M21.5 8.37V17.13C21.5 17.29 21.49 17.45 21.48 17.6H2.52C2.51 17.45 2.5 17.29 2.5 17.13V8.37C2.5 5.68 4.68 3.5 7.37 3.5H16.63C19.32 3.5 21.5 5.68 21.5 8.37Z"
          fill={color}
        />
        <path
          d="M21.48 17.5996C21.24 20.0696 19.16 21.9996 16.63 21.9996H7.37002C4.84002 21.9996 2.76002 20.0696 2.52002 17.5996H21.48Z"
          fill={color}
        />
        <path
          d="M13.53 11.6198C13.98 11.3098 14.26 10.8498 14.26 10.2298C14.26 8.92976 13.22 8.25977 12 8.25977C10.78 8.25977 9.73 8.92976 9.73 10.2298C9.73 10.8498 10.02 11.3198 10.46 11.6198C9.85 11.9798 9.5 12.5598 9.5 13.2398C9.5 14.4798 10.45 15.2498 12 15.2498C13.54 15.2498 14.5 14.4798 14.5 13.2398C14.5 12.5598 14.15 11.9698 13.53 11.6198ZM12 9.49977C12.52 9.49977 12.9 9.78977 12.9 10.2898C12.9 10.7798 12.52 11.0898 12 11.0898C11.48 11.0898 11.1 10.7798 11.1 10.2898C11.1 9.78977 11.48 9.49977 12 9.49977ZM12 13.9998C11.34 13.9998 10.86 13.6698 10.86 13.0698C10.86 12.4698 11.34 12.1498 12 12.1498C12.66 12.1498 13.14 12.4798 13.14 13.0698C13.14 13.6698 12.66 13.9998 12 13.9998Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_4418_5096">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

// Export as default for easier imports
export default CalendarDateIcon;

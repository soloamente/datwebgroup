import React from "react";

interface StatusIconProps {
  /** The width of the icon in pixels */
  width?: number;
  /** The height of the icon in pixels */
  height?: number;
  /** The color of the icon stroke */
  strokeColor?: string;
  /** The width of the stroke */
  strokeWidth?: number;
  /** Additional CSS classes to apply */
  className?: string;
  /** Accessibility label for screen readers */
  ariaLabel?: string;
  /** Whether the icon should be focusable */
  focusable?: boolean;
}

/**
 * Status icon component - displays a circular status indicator
 * with curved lines representing activity or status
 */
export const StatusIcon: React.FC<StatusIconProps> = ({
  width = 24,
  height = 24,
  strokeColor = "currentColor",
  strokeWidth = 1.5,
  className = "",
  ariaLabel = "Status indicator",
  focusable = false,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={ariaLabel}
      focusable={focusable}
      role="img"
    >
      <g clipPath="url(#clip0_4418_9781)">
        {/* Top curved line */}
        <path
          d="M2.19995 14.0195C3.12995 18.5795 7.15995 21.9995 12 21.9995C16.82 21.9995 20.8399 18.5895 21.7899 14.0495"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottom curved line */}
        <path
          d="M21.81 10.06C20.91 5.46 16.86 2 12 2C7.16995 2 3.13995 5.43001 2.19995 9.98001"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center circle */}
        <path
          d="M12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5Z"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4418_9781">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default StatusIcon;

import React from "react";

interface CloseIconProps {
  /** The width and height of the icon in pixels */
  size?: number;
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
  /** Click handler for the icon */
  onClick?: () => void;
}

/**
 * CloseIcon - A circular close/X icon component
 *
 * Features:
 * - Fully customizable size, stroke color, and stroke width
 * - Accessibility support with aria-label
 * - TypeScript support with proper prop types
 * - Click handler support
 * - Responsive design with customizable classes
 */
const CloseIcon: React.FC<CloseIconProps> = ({
  size = 24,
  strokeColor = "currentColor",
  strokeWidth = 1.5,
  className = "",
  ariaLabel = "Close",
  focusable = false,
  onClick,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={ariaLabel}
      focusable={focusable}
      onClick={onClick}
      role={onClick ? "button" : "img"}
      tabIndex={onClick && focusable ? 0 : undefined}
    >
      <g clipPath="url(#clip0_4418_9821)">
        {/* Circular background */}
        <path
          d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* First diagonal line of the X */}
        <path
          d="M9.17004 14.8299L14.83 9.16992"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Second diagonal line of the X */}
        <path
          d="M14.83 14.8299L9.17004 9.16992"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4418_9821">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CloseIcon;

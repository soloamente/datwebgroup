import type { FC } from "react";

// Define the props for the Icon component
interface IconProps {
  /**
   * The size of the icon in pixels. Defaults to 24.
   */
  size?: number;
  /**
   * The color of the icon. Defaults to black.
   */
  color?: string;
  /**
   * Accessible label for the icon (for screen readers).
   */
  "aria-label"?: string;
  /**
   * Additional class names for styling.
   */
  className?: string;
}

/**
 * QR Icon SVG component
 *
 * This component renders a scalable vector graphic (SVG) representing a QR code icon.
 * It is accessible, customizable, and uses TypeScript for type safety.
 */
export const QrIcon: FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  "aria-label": ariaLabel = "QR code icon",
  className,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      {/* The main group for the icon, clipped to a 24x24 box */}
      <g clipPath="url(#clip0_4418_8310)">
        {/* Four corner squares */}
        <path
          d="M2.77 10C2.34 10 2 9.66 2 9.23V6.92C2 4.21 4.21 2 6.92 2H9.23C9.66 2 10 2.34 10 2.77C10 3.2 9.66 3.54 9.23 3.54H6.92C5.05 3.54 3.54 5.06 3.54 6.92V9.23C3.54 9.66 3.19 10 2.77 10Z"
          fill={color}
        />
        <path
          d="M21.23 10C20.81 10 20.46 9.66 20.46 9.23V6.92C20.46 5.05 18.94 3.54 17.08 3.54H14.77C14.34 3.54 14 3.19 14 2.77C14 2.35 14.34 2 14.77 2H17.08C19.79 2 22 4.21 22 6.92V9.23C22 9.66 21.66 10 21.23 10Z"
          fill={color}
        />
        <path
          d="M17.0799 21.9997H15.6899C15.2699 21.9997 14.9199 21.6597 14.9199 21.2297C14.9199 20.8097 15.2599 20.4597 15.6899 20.4597H17.0799C18.9499 20.4597 20.4599 18.9397 20.4599 17.0797V15.6997C20.4599 15.2797 20.7999 14.9297 21.2299 14.9297C21.6499 14.9297 21.9999 15.2697 21.9999 15.6997V17.0797C21.9999 19.7897 19.7899 21.9997 17.0799 21.9997Z"
          fill={color}
        />
        <path
          d="M9.23 22H6.92C4.21 22 2 19.79 2 17.08V14.77C2 14.34 2.34 14 2.77 14C3.2 14 3.54 14.34 3.54 14.77V17.08C3.54 18.95 5.06 20.46 6.92 20.46H9.23C9.65 20.46 10 20.8 10 21.23C10 21.66 9.66 22 9.23 22Z"
          fill={color}
        />
        {/* Horizontal bar in the middle */}
        <path
          d="M18.46 11.2305H17.1H6.90002H5.54002C5.11002 11.2305 4.77002 11.5805 4.77002 12.0005C4.77002 12.4205 5.11002 12.7705 5.54002 12.7705H6.90002H17.1H18.46C18.89 12.7705 19.23 12.4205 19.23 12.0005C19.23 11.5805 18.89 11.2305 18.46 11.2305Z"
          fill={color}
        />
        {/* Lower and upper rectangles */}
        <path
          d="M6.8999 13.9405V14.2705C6.8999 15.9305 8.2399 17.2705 9.8999 17.2705H14.0999C15.7599 17.2705 17.0999 15.9305 17.0999 14.2705V13.9405C17.0999 13.8205 17.0099 13.7305 16.8899 13.7305H7.1099C6.9899 13.7305 6.8999 13.8205 6.8999 13.9405Z"
          fill={color}
        />
        <path
          d="M6.8999 10.0605V9.73047C6.8999 8.07047 8.2399 6.73047 9.8999 6.73047H14.0999C15.7599 6.73047 17.0999 8.07047 17.0999 9.73047V10.0605C17.0999 10.1805 17.0099 10.2705 16.8899 10.2705H7.1099C6.9899 10.2705 6.8999 10.1805 6.8999 10.0605Z"
          fill={color}
        />
      </g>
      <defs>
        {/* Define the clipping path for the icon */}
        <clipPath id="clip0_4418_8310">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

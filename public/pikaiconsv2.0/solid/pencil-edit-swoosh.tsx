import React from "react";
import { cn } from "@/lib/utils";

interface PencilEditSwooshIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const PencilEditSwooshIcon = ({
  size = 24,
  className,
  ...props
}: PencilEditSwooshIconProps) => {
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
        d="M19.3694 2.41139C18.3496 1.75249 17.0102 1.89746 16.1539 2.75743L3.10127 15.8674C2.86792 16.1018 2.63628 16.326 2.46569 16.601C2.32691 16.8247 2.22288 17.0682 2.15722 17.3234C2.0823 17.6146 2.0753 17.9137 2.06812 18.2205C2.04667 19.1373 2.02293 20.0541 2.0003 20.9708C1.98664 21.5241 2.44492 21.9946 2.99838 21.9955C3.9315 21.997 4.86463 21.9974 5.79775 22.0001C6.11411 22.001 6.42456 22.0019 6.72745 21.9292C6.99223 21.8656 7.24563 21.7606 7.47812 21.6177C7.76317 21.4423 7.99484 21.2007 8.23676 20.9577L21.213 7.92438C21.24 7.89732 21.2646 7.87261 21.2878 7.84821C22.0999 6.99108 22.2316 5.69241 21.6097 4.68949C21.0405 3.77005 20.2709 2.99387 19.3694 2.41139ZM21.6757 18.2629C22.0828 18.6361 22.1103 19.2686 21.7372 19.6757C20.4612 21.0677 19.3695 21.8322 18.3209 22.0845C17.2104 22.3516 16.3476 21.9971 15.7104 21.6718C15.0072 21.3127 14.7085 21.1023 14.292 21.0524C13.9967 21.0171 13.5019 21.0661 12.6317 21.7752C12.2036 22.1241 11.5737 22.0599 11.2248 21.6318C10.8759 21.2036 10.9401 20.5737 11.3683 20.2248C12.5071 19.2967 13.5279 18.9468 14.5295 19.0666C15.4098 19.1719 16.1892 19.6706 16.6199 19.8905C17.1166 20.1442 17.4435 20.2385 17.8531 20.1399C18.3245 20.0266 19.0833 19.6111 20.2628 18.3243C20.636 17.9172 21.2686 17.8897 21.6757 18.2629Z"
        fill="currentcolor"
      />
    </svg>
  );
};

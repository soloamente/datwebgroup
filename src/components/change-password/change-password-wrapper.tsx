"use client";

import ChangePasswordLeftSide from "@/components/change-password/change-password-left-side";
import ChangePasswordRightSide from "@/components/change-password/change-password-right-side";
import Aurora from "../backgrounds/aurora";

export default function ChangePasswordWrapper() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-2 overflow-hidden p-2">
      <ChangePasswordRightSide />
    </div>
  );
}

"use client";

import ChangePasswordLeftSide from "./change-password-left-side";
import ChangePasswordRightSide from "./change-password-right-side";

export default function ChangePasswordForm() {
  return (
    <div className="flex h-screen w-full items-center justify-center gap-2 overflow-hidden p-2">
      <ChangePasswordLeftSide />
      <ChangePasswordRightSide />
    </div>
  );
}

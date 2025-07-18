"use client";

interface MobileOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export function MobileOverlay({ isVisible, onClose }: MobileOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

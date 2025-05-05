"use client";

interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileOverlay({ isOpen, onClose }: MobileOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

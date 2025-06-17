import { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignaturePadProps {
  onSave?: (signature: string) => void;
  onClear?: () => void;
  className?: string;
}

export default function SignaturePad({
  onSave,
  onClear,
  className = "",
}: SignaturePadProps) {
  const signaturePadRef = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    // Set up any initial configuration
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  }, []);

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      onClear?.();
    }
  };

  const handleSave = () => {
    if (signaturePadRef.current) {
      const dataUrl = signaturePadRef.current.toDataURL();
      onSave?.(dataUrl);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <SignatureCanvas
        ref={signaturePadRef}
        canvasProps={{
          className: "w-full h-full rounded-lg bg-transparent",
          style: {
            minHeight: "160px",
            maxWidth: "100%",
            backgroundColor: "transparent",
          },
        }}
        backgroundColor="transparent"
      />
    </div>
  );
}

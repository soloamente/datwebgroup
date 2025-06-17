import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import SignaturePad, { type SignaturePadRef } from "./signature-pad";

interface SignatureDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
}

export default function SignatureDialog({
  open,
  onClose,
  onSave,
}: SignatureDialogProps) {
  const [signature, setSignature] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const signaturePadRef = useRef<SignaturePadRef>(null);

  const handleSave = () => {
    if (!isChecked || !signature) {
      return;
    }
    onSave(signature);
    onClose();
  };

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clearSignature();
    }
    setSignature("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <DialogContent className="max-w-md overflow-visible !border-0 !bg-transparent p-0 !shadow-none">
            {/* Overlay for backdrop blur */}
            <div
              className="fixed inset-0 z-40 backdrop-blur-sm"
              aria-hidden="true"
            />
            {/* Main dialog content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-50 mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl md:p-8 dark:bg-slate-900"
            >
              {/* Close button */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">ESC</span>
                <Button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="h-8 w-8 rounded-full bg-transparent p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Dialog header */}
              <h2 className="mb-6 text-xl font-semibold">Sign the contract</h2>

              {/* Signature area */}
              <div className="mb-6 h-40 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <SignaturePad
                  ref={signaturePadRef}
                  onChange={setSignature}
                  width={400}
                  height={160}
                  className="h-full w-full"
                />
              </div>

              {/* Action buttons */}
              <div className="mb-6 flex items-center gap-4">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg border-gray-200 dark:border-gray-700"
                  onClick={onClose}
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg border-gray-200 dark:border-gray-700"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>

              {/* Agreement checkbox */}
              <div className="mb-6">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    By signing, I confirm that I have read and therefore agree
                    to all contractual terms, which become legally binding
                  </span>
                </label>
                {!isChecked && (
                  <p className="mt-2 text-sm text-red-600">
                    Please confirm that you agree to all terms before signing
                  </p>
                )}
              </div>

              {/* Bottom buttons */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg border-gray-200 dark:border-gray-700"
                  onClick={() => {
                    /* Add manage signatures functionality */
                  }}
                >
                  Manage signatures
                </Button>
                <Button
                  className="flex-1 rounded-lg bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                  onClick={handleSave}
                  disabled={!isChecked || !signature}
                >
                  Sign the contract
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

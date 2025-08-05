"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdminQrScannerProps {
  onScan: (data: string) => void;
  onError: (error: string) => void;
  /**
   * If true, disables scanning and camera access. Used to prevent scanning when modal is closed or animating out.
   */
  disabled?: boolean;
}

export default function AdminQrScanner({
  onScan,
  onError,
  disabled = false,
}: AdminQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const animationFrameId: number | null = null;
  const router = useRouter();

  // Function to extract token from URL
  const extractTokenFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("token");
    } catch {
      return null;
    }
  };

  // Function to handle QR scan result
  const handleQrScan = async (qrText: string) => {
    if (isProcessing) return; // Prevent multiple processing

    setIsProcessing(true);

    try {
      // Check if the QR code contains a URL
      if (qrText.startsWith("http://") || qrText.startsWith("https://")) {
        const token = extractTokenFromUrl(qrText);

        if (token) {
          // Valid URL with token found
          toast.success("QR Code valido rilevato! Reindirizzamento...");

          // Redirect to login page with token
          router.push(`/login?token=${encodeURIComponent(token)}`);
        } else {
          // URL without token
          toast.error("QR Code non valido: token mancante nell'URL");
          onError("QR Code non valido: token mancante nell'URL");
        }
      } else {
        // Direct token or other format
        toast.error("QR Code non valido: formato non supportato");
        onError("QR Code non valido: formato non supportato");
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast.error("Errore durante l'elaborazione del QR Code");
      onError("Errore durante l'elaborazione del QR Code");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (disabled) return; // Do not start scanning if disabled
    const reader = new BrowserQRCodeReader();

    const startScanning = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Request camera permissions explicitly
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Explicitly ignore the returned promise to satisfy the linter
        void reader.decodeFromConstraints(
          { video: { facingMode: "environment" } },
          videoRef.current!,
          (result, err) => {
            if (result) {
              const qrText = result.getText();
              // Use our custom handler instead of the original onScan
              void handleQrScan(qrText);
              drawBox(result.getResultPoints());
            }
            // Do NOT set error for normal scan misses!
          },
        );

        setIsLoading(false);
      } catch (err) {
        // Messaggio di errore mostrato all'utente se l'accesso alla fotocamera viene negato
        const errorMessage =
          "Accesso alla fotocamera negato. Abilita l'accesso alla fotocamera per utilizzare il login QR.";
        setError(errorMessage); // Keep internal state for UI
        toast.error(errorMessage); // Show toast notification
        setIsLoading(false);
      }
    };
    void startScanning(); // Fix linter: explicitly ignore the returned promise

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [disabled]); // Remove onScan and onError from dependencies since we're handling it internally
  // eslint-disable-next-line
  function drawBox(points?: any[]) {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !points?.length) return;

    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;
    // eslint-disable-next-line
    const xs = points.map((p) => p.getX());
    // eslint-disable-next-line
    const ys = points.map((p) => p.getY());

    const margin = 20;
    // eslint-disable-next-line
    const targetLeft = Math.min(...xs) * scaleX - margin;
    // eslint-disable-next-line
    const targetTop = Math.min(...ys) * scaleY - margin;
    // eslint-disable-next-line
    const targetWidth =
      // eslint-disable-next-line
      (Math.max(...xs) - Math.min(...xs)) * scaleX + 2 * margin;

    const targetHeight =
      // eslint-disable-next-line
      (Math.max(...ys) - Math.min(...ys)) * scaleY + 2 * margin;

    ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(targetLeft, targetTop, targetWidth, targetHeight);
    ctx.strokeStyle = "#2196f3";
    ctx.lineWidth = 4;
    ctx.strokeRect(targetLeft, targetTop, targetWidth, targetHeight);
  }

  if (isLoading) {
    // Minimal loader UI
    return (
      <div className="bg-muted flex h-64 w-full items-center justify-center rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground text-xs">
            Inizializzazione fotocamera...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    // Only for fatal errors, show a friendly error and a retry button
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl bg-red-50">
        <p className="text-center text-sm text-red-600">{error}</p>
        <button
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          onClick={() => window.location.reload()} // Reload to retry camera access
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative mx-auto flex w-full max-w-xs flex-col items-center"
    >
      {/* Animated gradient background for visual interest, reused from QR modal. Purely decorative. */}
      <div
        className="pointer-events-none absolute -inset-1 animate-pulse rounded-2xl bg-gradient-to-tr from-blue-400/40 via-blue-200/10 to-blue-600/30 blur-sm"
        aria-hidden="true"
      />
      {/* Video preview with minimal border and shadow */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-gray-200 shadow-lg">
        <video
          ref={videoRef}
          className="h-full w-full rounded-xl object-cover"
          onLoadedMetadata={() => {
            if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.clientWidth;
              canvasRef.current.height = videoRef.current.clientHeight;
            }
          }}
          aria-label="Anteprima fotocamera per scansione QR"
        />
        {/* Minimal scan guide overlay */}
        <div
          className="border-primary/60 pointer-events-none absolute inset-0 rounded-xl border-4"
          aria-hidden="true"
        />
        {/* Canvas for optional QR box (kept for future, but hidden for minimalism) */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
          <div className="flex flex-col items-center gap-2 rounded-lg bg-white/90 p-4">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            <p className="text-sm font-medium">Elaborazione QR Code...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

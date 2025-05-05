"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { motion } from "framer-motion";

interface AdminQrScannerProps {
  onScan: (data: string) => void;
  onError: (error: string) => void;
}

export default function AdminQrScanner({
  onScan,
  onError,
}: AdminQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const animationFrameId: number | null = null;

  useEffect(() => {
    // eslint-disable-next-line
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

        // eslint-disable-next-line
        reader.decodeFromConstraints(
          { video: { facingMode: "environment" } },
          videoRef.current!,
          (result, err) => {
            if (result) {
              // eslint-disable-next-line
              const qrText = result.getText();
              // eslint-disable-next-line
              onScan(qrText);
              // eslint-disable-next-line
              drawBox(result.getResultPoints());
            }
            if (err && !result) {
              setError("Failed to scan QR code. Please try again.");
              onError("Failed to scan QR code");
            }
          },
        );

        setIsLoading(false);
      } catch (err) {
        setError(
          "Camera access denied. Please enable camera access to use QR login.",
        );
        onError("Camera access denied");
        setIsLoading(false);
      }
    };
    // eslint-disable-next-line
    startScanning();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [onScan, onError]);
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
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-100">
        <div className="text-center">
          <div className="border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-sm text-gray-600">Initializing camera...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-red-50">
        <div className="text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative mx-auto w-full max-w-sm"
    >
      <video
        ref={videoRef}
        className="w-full rounded-lg shadow"
        onLoadedMetadata={() => {
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.clientWidth;
            canvasRef.current.height = videoRef.current.clientHeight;
          }
        }}
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
      />
    </motion.div>
  );
}

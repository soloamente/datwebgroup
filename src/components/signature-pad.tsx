import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

interface Point {
  x: number;
  y: number;
}

interface SignaturePadProps {
  onChange?: (signature: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface SignaturePadRef {
  clearSignature: () => void;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onChange, onClear, width = 400, height = 160, className = "" }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPoint, setLastPoint] = useState<Point | null>(null);

    useImperativeHandle(ref, () => ({
      clearSignature: () => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        if (onClear) {
          onClear();
        }
        if (onChange) {
          onChange("");
        }
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Set initial styles
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }, [width, height]);

    const getCoordinates = (event: MouseEvent | TouchEvent): Point | null => {
      if (!canvasRef.current) return null;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      if (event instanceof MouseEvent) {
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      } else if (event instanceof TouchEvent && event.touches.length > 0) {
        const touch = event.touches[0];
        if (!touch) return null;

        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      }
      return null;
    };

    const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault();
      const point = getCoordinates(event.nativeEvent);
      if (!point) return;

      setIsDrawing(true);
      setLastPoint(point);
    };

    const draw = (event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault();
      if (!isDrawing || !lastPoint || !canvasRef.current) return;

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      const currentPoint = getCoordinates(event.nativeEvent);
      if (!currentPoint) return;

      // Draw line from last point to current point
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();

      setLastPoint(currentPoint);

      // Notify parent component of change
      if (onChange) {
        onChange(canvasRef.current.toDataURL());
      }
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      setLastPoint(null);
    };

    return (
      <canvas
        ref={canvasRef}
        className={`cursor-crosshair touch-none ${className}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    );
  },
);

SignaturePad.displayName = "SignaturePad";

export default SignaturePad;

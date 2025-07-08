import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "./button";
import { RiUploadCloud2Line, RiCloseLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

interface CoverUploaderProps {
  onFileCropped: (file: File | null) => void;
  className?: string;
}

const CoverUploader: React.FC<CoverUploaderProps> = ({
  onFileCropped,
  className,
}) => {
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [croppedImagePreview, setCroppedImagePreview] = useState<string | null>(
    null,
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file) {
        setFileName(file.name);
        setCrop(undefined); // Reset crop on new image
        setCroppedImagePreview(null); // Reset preview
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          if (typeof reader.result === "string") {
            setImgSrc(reader.result);
          } else {
            setImgSrc("");
          }
        });
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleSaveCrop = async () => {
    if (completedCrop && imgRef.current) {
      const croppedImageFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        fileName,
      );
      onFileCropped(croppedImageFile);
      // Create a URL for the preview
      const previewUrl = URL.createObjectURL(croppedImageFile);
      setCroppedImagePreview(previewUrl);
      setImgSrc(""); // Close the modal/cropper view
    }
  };

  const handleCancel = () => {
    setImgSrc("");
    // Do not clear the file here, only on explicit removal
  };

  const handleRemoveImage = () => {
    setCroppedImagePreview(null);
    onFileCropped(null);
  };

  if (imgSrc) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-card text-card-foreground mx-4 max-w-2xl rounded-2xl border p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-semibold">Ritaglia Immagine</h2>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={9 / 16}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Crop preview"
              style={{ maxHeight: "70vh" }}
            />
          </ReactCrop>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Annulla
            </Button>
            <Button onClick={handleSaveCrop}>Salva Ritaglio</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-muted-foreground/20 relative flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors duration-300",
        isDragActive
          ? "border-primary bg-primary/10"
          : "bg-card hover:border-primary/60",
        className,
      )}
    >
      <input {...getInputProps()} />
      {croppedImagePreview ? (
        <div className="relative h-full w-full">
          <div
            className="h-full w-full rounded-lg bg-cover bg-center"
            style={{ backgroundImage: `url(${croppedImagePreview})` }}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={handleRemoveImage}
          >
            <RiCloseLine className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          <div
            className={`rounded-full p-4 transition-colors duration-300 ${
              isDragActive ? "bg-primary/20" : "bg-muted/50"
            }`}
          >
            <RiUploadCloud2Line
              className={`size-10 transition-colors duration-300 ${
                isDragActive ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </div>
          {isDragActive ? (
            <p className="text-primary text-lg font-semibold">
              Rilascia l&apos;immagine qui
            </p>
          ) : (
            <div className="flex w-full flex-col items-center text-balance">
              <p className="text-foreground text-xl font-medium">
                Trascina o<br />
                seleziona un&apos;immagine per la tua classe documentale
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                PNG, JPG, o SVG (9:16 raccomandato)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function getCroppedImg(
  image: HTMLImageElement,
  crop: Crop,
  fileName: string,
): Promise<File> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(new File([blob], fileName, { type: blob.type }));
    }, "image/png");
  });
}

export default CoverUploader;

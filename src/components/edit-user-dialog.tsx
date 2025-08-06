"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Point, Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input as KamuiInput } from "@/components/ui/kamui/input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button as KamuiButton } from "@/components/ui/button/button";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { type Sharer, type UpdateSharerData, userService } from "@/app/api/api";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
  Upload,
  XIcon,
  ArrowLeftIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

// Helper to create an image element from a URL
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(new Error("Failed to load image")),
    );
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

// Helper to get a cropped image blob from the canvas
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) return null;

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    croppedCanvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
}

// Validation functions
const isValidEmail = (email: string) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCodiceFiscale = (cf: string): string | null => {
  if (!cf) return null; // Optional field
  const cfRegex = /^[A-Z0-9]{16}$/i;
  if (!cfRegex.test(cf))
    return "Il Codice Fiscale deve contenere 16 caratteri alfanumerici.";
  return null;
};

const validatePartitaIva = (piva: string): string | null => {
  if (!piva) return null; // Optional field
  const pivaRegex = /^[0-9]{11}$/;
  if (!pivaRegex.test(piva)) return "La Partita IVA deve contenere 11 cifre.";
  return null;
};

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: Sharer | null;
  onUserUpdate: () => void;
}

export function EditUserDialog({
  isOpen,
  onClose,
  user,
  onUserUpdate,
}: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [formData, setFormData] = useState<UpdateSharerData>({
    nominativo: "",
    email: "",
    codice_fiscale: "",
    partita_iva: "",
  });
  const [errors, setErrors] = useState<
    Record<string, string | null | undefined>
  >({
    nominativo: null,
    email: null,
    codice_fiscale: null,
    partita_iva: null,
    form: null,
  });

  const isFormValid = React.useMemo(() => {
    return (
      formData.nominativo.trim() !== "" &&
      formData.email.trim() !== "" &&
      isValidEmail(formData.email) &&
      !validateCodiceFiscale(formData.codice_fiscale ?? "") &&
      !validatePartitaIva(formData.partita_iva ?? "")
    );
  }, [formData]);

  // Reset state on close and populate on open
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          nominativo: user.nominativo,
          email: user.email,
          codice_fiscale: user.codice_fiscale ?? "",
          partita_iva: user.partita_iva ?? "",
        });
        setLogoPreview(user.logo_url ?? null);
      }
    } else {
      // Full reset on close
      setFormData({
        nominativo: "",
        email: "",
        codice_fiscale: "",
        partita_iva: "",
      });
      setErrors({});
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoPreview(null);
      setLogoFile(null);
      setImageSrc(null);
      setIsCropDialogOpen(false);
      setIsLoading(false);
      setIsDragging(false);
    }
  }, [isOpen, user]);

  const processFile = useCallback((file: File | undefined | null) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Il file del logo non può superare i 2MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Per favore, carica un file immagine valido.");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);
        setIsCropDialogOpen(true);
      }
    });
    reader.readAsDataURL(file);
  }, []);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
    e.target.value = ""; // Reset file input
  };

  const showCroppedImage = useCallback(async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (croppedImage) {
          const croppedFile = new File([croppedImage], "logo.jpg", {
            type: "image/jpeg",
          });
          setLogoFile(croppedFile);
          if (logoPreview?.startsWith("blob:")) {
            URL.revokeObjectURL(logoPreview);
          }
          setLogoPreview(URL.createObjectURL(croppedImage));
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Impossibile ritagliare l'immagine.");
    }
    setIsCropDialogOpen(false);
  }, [imageSrc, croppedAreaPixels, logoPreview]);

  const handleRemoveFinalImage = () => {
    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(user?.logo_url ?? null);
    setLogoFile(null);
    setImageSrc(null);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const finalValue = name === "codice_fiscale" ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    let errorMessage: string | null = null;
    switch (name) {
      case "email":
        errorMessage = isValidEmail(finalValue)
          ? null
          : "Formato email non valido.";
        break;
      case "codice_fiscale":
        errorMessage = validateCodiceFiscale(finalValue);
        break;
      case "partita_iva":
        errorMessage = validatePartitaIva(finalValue);
        break;
      case "nominativo":
        errorMessage =
          finalValue.trim() === "" ? "Il nominativo è obbligatorio." : null;
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !user) {
      toast.error(
        "Per favore, compila correttamente tutti i campi obbligatori.",
      );
      return;
    }
    setIsLoading(true);
    setErrors({});

    try {
      const updateData: UpdateSharerData = {
        nominativo: formData.nominativo,
        email: formData.email,
        codice_fiscale: formData.codice_fiscale,
        partita_iva: formData.partita_iva,
      };

      await userService.updateSharer(user.id, updateData);

      if (logoFile) {
        await userService.updateSharerLogo(user.id, logoFile);
      }

      toast.success("Sharer aggiornato con successo.");
      onUserUpdate();
      onClose();
    } catch (err: unknown) {
      let errorMessage = "Errore durante l'aggiornamento dello sharer.";
      const newErrors: Record<string, string | null> = { form: errorMessage };
      if (err && typeof err === "object" && "response" in err && err.response) {
        const response = err.response as {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
        if (response.data?.errors) {
          const fieldErrors = response.data.errors;
          let firstError: string | undefined;
          Object.keys(fieldErrors).forEach((key) => {
            const msg = fieldErrors[key]?.[0];
            if (msg) {
              newErrors[key] = msg;
              if (!firstError) firstError = msg;
            }
          });
          errorMessage = firstError ?? errorMessage;
        } else if (response.data?.message) {
          errorMessage = response.data.message;
        }
      }
      setErrors(newErrors);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="bg-background grid max-w-4xl overflow-hidden rounded-3xl border-transparent p-0 shadow-2xl md:grid-cols-2">
          <VisuallyHidden>
            <DialogTitle>Modifica Sharer</DialogTitle>
          </VisuallyHidden>

          <div className="flex flex-col justify-center p-12">
            <div className="w-full">
              <h1 className="text-foreground text-3xl font-medium">
                Modifica Sharer
              </h1>
              <p className="text-foreground/60 mb-8 text-sm">
                Modifica i dati dello sharer.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="username-display"
                    className="text-foreground/60 text-sm"
                  >
                    Username
                  </Label>
                  <KamuiInput
                    id="username-display"
                    name="username-display"
                    value={user?.username ?? ""}
                    readOnly
                    disabled
                    size="xl"
                    radius="xl"
                    placeholder="es. mariorossi"
                    className="cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="nominativo"
                    className="text-foreground/60 text-sm"
                  >
                    Nominativo / Ragione Sociale *
                  </Label>
                  <KamuiInput
                    id="nominativo"
                    name="nominativo"
                    value={formData.nominativo}
                    onChange={handleInputChange}
                    required
                    loading={isLoading}
                    error={!!errors.nominativo}
                    size="xl"
                    radius="xl"
                    placeholder="es. Mario Rossi / Studio SRL"
                  />
                  {errors.nominativo && (
                    <p className="text-destructive mt-1 text-xs">
                      {errors.nominativo}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground/60 text-sm">
                    Email *
                  </Label>
                  <KamuiInput
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    loading={isLoading}
                    error={!!errors.email}
                    size="xl"
                    radius="xl"
                    placeholder="es. email@esempio.com"
                  />
                  {errors.email && (
                    <p className="text-destructive mt-1 text-xs">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background text-muted-foreground px-2">
                      Informazioni Opzionali
                    </span>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="codice_fiscale"
                      className="text-foreground/60 text-sm"
                    >
                      Codice Fiscale
                    </Label>
                    <KamuiInput
                      id="codice_fiscale"
                      name="codice_fiscale"
                      value={formData.codice_fiscale}
                      onChange={handleInputChange}
                      loading={isLoading}
                      error={!!errors.codice_fiscale}
                      size="xl"
                      radius="xl"
                      placeholder="RSSMRA80A01H501U"
                    />
                    {errors.codice_fiscale && (
                      <p className="text-destructive mt-1 text-xs">
                        {errors.codice_fiscale}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="partita_iva"
                      className="text-foreground/60 text-sm"
                    >
                      Partita IVA
                    </Label>
                    <KamuiInput
                      id="partita_iva"
                      name="partita_iva"
                      value={formData.partita_iva}
                      onChange={handleInputChange}
                      loading={isLoading}
                      error={!!errors.partita_iva}
                      size="xl"
                      radius="xl"
                      placeholder="12345678901"
                    />
                    {errors.partita_iva && (
                      <p className="text-destructive mt-1 text-xs">
                        {errors.partita_iva}
                      </p>
                    )}
                  </div>
                </div>

                {errors.form && (
                  <div className="text-destructive pt-2 text-sm">
                    {errors.form}
                  </div>
                )}

                <div className="space-y-4 pt-6">
                  <KamuiButton
                    type="submit"
                    isDisabled={!isFormValid || isLoading}
                    pending={isLoading}
                    color="primary"
                    size="lg"
                    radius="lg"
                    className="w-full text-base font-medium"
                  >
                    Salva Modifiche
                  </KamuiButton>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-muted/50 flex items-center justify-center p-8">
            <div className="relative inline-flex flex-col items-center">
              <Label
                htmlFor="logo-upload-edit"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={cn(
                  "hover:bg-accent/50 relative flex h-36 w-36 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-all duration-300",
                  { "border-solid": logoPreview },
                  {
                    "border-primary bg-primary/10 ring-primary ring-offset-background border-solid ring-2 ring-offset-2":
                      isDragging,
                  },
                )}
              >
                {logoPreview ? (
                  <img
                    className="size-full object-cover"
                    src={logoPreview}
                    alt="User avatar"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className={cn(
                      "text-muted-foreground flex flex-col items-center justify-center transition-all duration-300",
                      { "text-primary scale-110 font-bold": isDragging },
                    )}
                  >
                    <Upload
                      className={cn("h-10 w-10 transition-transform", {
                        "scale-125 animate-bounce": isDragging,
                      })}
                    />
                    <span className="mt-2 text-sm">
                      {isDragging ? "Rilascia per caricare" : "Carica Logo"}
                    </span>
                  </div>
                )}
              </Label>
              {logoPreview && (
                <Button
                  onClick={handleRemoveFinalImage}
                  size="icon"
                  variant="destructive"
                  className="border-background focus-visible:border-background absolute -top-1 -right-1 size-7 rounded-full border-2 shadow-none"
                  aria-label="Remove image"
                >
                  <XIcon className="size-4" />
                </Button>
              )}
              <Input
                id="logo-upload-edit"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-140">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-my-1 opacity-60"
                  onClick={() => setIsCropDialogOpen(false)}
                  aria-label="Annulla"
                >
                  <ArrowLeftIcon aria-hidden="true" />
                </Button>
                <span>Ritaglia immagine</span>
              </div>
              <Button
                className="-my-1"
                onClick={showCroppedImage}
                disabled={!imageSrc}
                autoFocus
              >
                Applica
              </Button>
            </DialogTitle>
          </DialogHeader>
          {imageSrc && (
            <div className="relative h-96">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
          )}
          <DialogFooter className="border-t px-4 py-6">
            <div className="mx-auto flex w-full max-w-80 items-center gap-4">
              <ZoomOutIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => {
                  if (value[0] !== undefined) setZoom(value[0]);
                }}
                aria-label="Zoom slider"
              />
              <ZoomInIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

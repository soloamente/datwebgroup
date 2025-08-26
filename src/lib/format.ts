export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {},
) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "long",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    }).format(new Date(date));
  } catch (_err) {
    return "";
  }
}

// Helper function to get file name without extension
export const getFileNameWithoutExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
};

// Helper function to get file extension
export const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex > 0 ? filename.substring(lastDotIndex) : "";
};

// Helper function to format file size
export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Helper function to convert MIME types to user-friendly names in Italian
export const getFileTypeName = (mimeType: string): string => {
  const mimeTypeMap: Record<string, string> = {
    // Documenti
    "application/pdf": "PDF",
    "application/msword": "Word",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word",
    "application/vnd.ms-excel": "Excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "Excel",
    "application/vnd.ms-powerpoint": "PowerPoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "PowerPoint",

    // Immagini
    "image/jpeg": "JPEG",
    "image/jpg": "JPEG",
    "image/png": "PNG",
    "image/gif": "GIF",
    "image/webp": "WebP",
    "image/svg+xml": "SVG",
    "image/bmp": "BMP",
    "image/tiff": "TIFF",

    // Testo
    "text/plain": "Testo",
    "text/html": "HTML",
    "text/css": "CSS",
    "text/javascript": "JavaScript",
    "application/json": "JSON",
    "application/xml": "XML",

    // Archivi
    "application/zip": "ZIP",
    "application/x-rar-compressed": "RAR",
    "application/x-7z-compressed": "7-Zip",
    "application/gzip": "GZIP",
    "application/tar": "TAR",

    // Audio
    "audio/mpeg": "MP3",
    "audio/wav": "WAV",
    "audio/ogg": "OGG",
    "audio/mp4": "AAC",
    "audio/aac": "AAC",

    // Video
    "video/mp4": "MP4",
    "video/avi": "AVI",
    "video/mov": "MOV",
    "video/wmv": "WMV",
    "video/flv": "FLV",
    "video/webm": "WebM",

    // Altri formati comuni
    "application/rtf": "RTF",
    "application/csv": "CSV",
    "application/x-pdf": "PDF",
  };

  return mimeTypeMap[mimeType] ?? mimeType;
};

// Helper function to get appropriate Bootstrap icon for file types
export const getFileTypeIcon = (mimeType: string): string => {
  const iconMap: Record<string, string> = {
    // Documenti
    "application/pdf": "BsFileEarmarkPdfFill",
    "application/msword": "BsFileEarmarkWordFill",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "BsFileEarmarkWordFill",
    "application/vnd.ms-excel": "BsFileEarmarkExcelFill",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "BsFileEarmarkExcelFill",
    "application/vnd.ms-powerpoint": "BsFileEarmarkPptFill",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "BsFileEarmarkPptFill",

    // Immagini
    "image/jpeg": "BsFileEarmarkImageFill",
    "image/jpg": "BsFileEarmarkImageFill",
    "image/png": "BsFileEarmarkImageFill",
    "image/gif": "BsFileEarmarkImageFill",
    "image/webp": "BsFileEarmarkImageFill",
    "image/svg+xml": "BsFileEarmarkImageFill",
    "image/bmp": "BsFileEarmarkImageFill",
    "image/tiff": "BsFileEarmarkImageFill",

    // Testo
    "text/plain": "BsFileEarmarkTextFill",
    "text/html": "BsFileEarmarkCodeFill",
    "text/css": "BsFileEarmarkCodeFill",
    "text/javascript": "BsFileEarmarkCodeFill",
    "application/json": "BsFileEarmarkCodeFill",
    "application/xml": "BsFileEarmarkCodeFill",

    // Archivi
    "application/zip": "BsFileEarmarkZipFill",
    "application/x-rar-compressed": "BsFileEarmarkZipFill",
    "application/x-7z-compressed": "BsFileEarmarkZipFill",
    "application/gzip": "BsFileEarmarkZipFill",
    "application/tar": "BsFileEarmarkZipFill",

    // Audio
    "audio/mpeg": "BsFileEarmarkMusicFill",
    "audio/wav": "BsFileEarmarkMusicFill",
    "audio/ogg": "BsFileEarmarkMusicFill",
    "audio/mp4": "BsFileEarmarkMusicFill",
    "audio/aac": "BsFileEarmarkMusicFill",

    // Video
    "video/mp4": "BsFileEarmarkPlayFill",
    "video/avi": "BsFileEarmarkPlayFill",
    "video/mov": "BsFileEarmarkPlayFill",
    "video/wmv": "BsFileEarmarkPlayFill",
    "video/flv": "BsFileEarmarkPlayFill",
    "video/webm": "BsFileEarmarkPlayFill",

    // Altri formati comuni
    "application/rtf": "BsFileEarmarkTextFill",
    "application/csv": "BsFileEarmarkSpreadsheetFill",
    "application/x-pdf": "BsFileEarmarkPdfFill",
  };

  return iconMap[mimeType] ?? "BsFileEarmarkFill";
};

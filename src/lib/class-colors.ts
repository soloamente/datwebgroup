// Shared color utilities for document classes
// Keep this palette in sync with UI expectations in recent shares and charts

export const CLASS_COLORS: readonly string[] = [
  "hsl(210, 70%, 60%)", // Blue
  "hsl(150, 70%, 60%)", // Green
  "hsl(280, 70%, 60%)", // Purple
  "hsl(30, 70%, 60%)", // Orange
  "hsl(340, 70%, 60%)", // Pink
  "hsl(60, 70%, 60%)", // Yellow
  "hsl(180, 70%, 60%)", // Cyan
  "hsl(120, 70%, 60%)", // Lime
] as const;

/**
 * Returns a color for a document class based on its numeric id.
 * Uses a cyclical palette to ensure stable, consistent mapping across the app.
 */
export function getDocumentClassColorById(classId: number): string {
  const index = Math.abs(classId) % CLASS_COLORS.length;
  return CLASS_COLORS[index]!;
}

/**
 * Fallback: derive a stable color from a class name using a simple hash.
 * Only used when an id is not available. Prefer getDocumentClassColorById.
 */
export function getDocumentClassColorByName(className: string): string {
  let hash = 0;
  for (let i = 0; i < className.length; i++) {
    hash = (hash << 5) - hash + className.charCodeAt(i);
    hash |= 0; // Convert to 32bit int
  }
  const index = Math.abs(hash) % CLASS_COLORS.length;
  return CLASS_COLORS[index]!;
}

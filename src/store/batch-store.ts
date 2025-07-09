import { create } from "zustand";
import { type DocumentClassDetails } from "@/app/api/api";
import { type EnrichedDocument } from "@/components/dashboard/tables/sharer/shared-documents-table";

interface BatchState {
  batches: EnrichedDocument[];
  documentClass: DocumentClassDetails | null;
  setBatches: (
    batches: EnrichedDocument[],
    documentClass: DocumentClassDetails,
  ) => void;
  getBatchById: (id: number) => EnrichedDocument | undefined;
}

export const useBatchStore = create<BatchState>((set, get) => ({
  batches: [],
  documentClass: null,
  setBatches: (batches, documentClass) => set({ batches, documentClass }),
  getBatchById: (id) => get().batches.find((batch) => batch.id === id),
}));

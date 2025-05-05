import { type FilterFn } from "@tanstack/react-table";
import { type Sharer, type Viewer } from "@/app/api/api";

declare module "@tanstack/react-table" {
  interface FilterFns {
    activeStatus: FilterFn<Sharer | Viewer>;
    dateRange: FilterFn<Sharer | Viewer>;
  }
}

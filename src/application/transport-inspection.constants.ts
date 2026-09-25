import type { StorageCategoryName } from "../infrastructure/storage-inventory.types.ts";
export const transportCategories: readonly StorageCategoryName[] = [
  "artifacts",
  "checkpoints",
  "conversations",
  "recovery",
  "logs",
  "reservations",
  "resources",
];

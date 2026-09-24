import type { StorageCategoryName } from "./storage-inventory.types.ts";

export const storageCategories: readonly StorageCategoryName[] = [
  "recovery",
  "logs",
  "locks",
  "workspaces",
];
export const storageInventoryDefaults = Object.freeze({
  maxEntries: 100_000,
  maxDepth: 64,
});

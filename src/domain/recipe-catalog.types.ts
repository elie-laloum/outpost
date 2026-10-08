export interface RecipeCatalogEntry {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly source: string;
  readonly sha256: string;
}

export interface RecipeCatalog {
  readonly version: 1;
  readonly recipes: readonly RecipeCatalogEntry[];
}

export interface RecipeSecretSelection {
  readonly source: { readonly $ref: string };
  readonly names: readonly string[];
  readonly timeoutMs?: number;
}
